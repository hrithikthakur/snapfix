#include <napi.h>
#include <ApplicationServices/ApplicationServices.h>
#include <Carbon/Carbon.h>
#include <string>

// Check if accessibility permissions are granted
bool hasAccessibilityPermissions() {
    return AXIsProcessTrusted();
}

// Get the currently selected text from the focused application
std::string getSelectedText() {
    if (!hasAccessibilityPermissions()) {
        return "";
    }
    
    // Get the currently focused application
    AXUIElementRef systemWideElement = AXUIElementCreateSystemWide();
    AXUIElementRef focusedApp = nullptr;
    AXError error = AXUIElementCopyAttributeValue(
        systemWideElement,
        kAXFocusedApplicationAttribute,
        (CFTypeRef*)&focusedApp
    );
    
    if (error != kAXErrorSuccess || !focusedApp) {
        CFRelease(systemWideElement);
        return "";
    }
    
    // Get the focused window
    AXUIElementRef focusedWindow = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedApp,
        kAXFocusedWindowAttribute,
        (CFTypeRef*)&focusedWindow
    );
    
    if (error != kAXErrorSuccess || !focusedWindow) {
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return "";
    }
    
    // Get the focused element (likely a text field)
    AXUIElementRef focusedElement = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedWindow,
        kAXFocusedUIElementAttribute,
        (CFTypeRef*)&focusedElement
    );
    
    if (error != kAXErrorSuccess || !focusedElement) {
        CFRelease(focusedWindow);
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return "";
    }
    
    // Get selected text range
    CFTypeRef selectedTextRange = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedElement,
        kAXSelectedTextRangeAttribute,
        &selectedTextRange
    );
    
    if (error != kAXErrorSuccess || !selectedTextRange) {
        CFRelease(focusedElement);
        CFRelease(focusedWindow);
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return "";
    }
    
    // Get the selected text
    CFTypeRef selectedText = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedElement,
        kAXSelectedTextAttribute,
        &selectedText
    );
    
    std::string result = "";
    if (error == kAXErrorSuccess && selectedText) {
        CFStringRef textString = (CFStringRef)selectedText;
        if (textString && CFGetTypeID(textString) == CFStringGetTypeID()) {
            CFIndex length = CFStringGetLength(textString);
            if (length > 0) {
                char* buffer = new char[length * 4 + 1]; // UTF-8 can be up to 4 bytes per character
                CFStringGetCString(textString, buffer, length * 4 + 1, kCFStringEncodingUTF8);
                result = std::string(buffer);
                delete[] buffer;
            }
        }
        CFRelease(selectedText);
    }
    
    // Cleanup
    CFRelease(selectedTextRange);
    CFRelease(focusedElement);
    CFRelease(focusedWindow);
    CFRelease(focusedApp);
    CFRelease(systemWideElement);
    
    return result;
}

// Replace the selected text with new text
bool replaceSelectedText(const std::string& newText) {
    if (!hasAccessibilityPermissions()) {
        return false;
    }
    
    // Get the currently focused application
    AXUIElementRef systemWideElement = AXUIElementCreateSystemWide();
    AXUIElementRef focusedApp = nullptr;
    AXError error = AXUIElementCopyAttributeValue(
        systemWideElement,
        kAXFocusedApplicationAttribute,
        (CFTypeRef*)&focusedApp
    );
    
    if (error != kAXErrorSuccess || !focusedApp) {
        CFRelease(systemWideElement);
        return false;
    }
    
    // Get the focused window
    AXUIElementRef focusedWindow = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedApp,
        kAXFocusedWindowAttribute,
        (CFTypeRef*)&focusedWindow
    );
    
    if (error != kAXErrorSuccess || !focusedWindow) {
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return false;
    }
    
    // Get the focused element
    AXUIElementRef focusedElement = nullptr;
    error = AXUIElementCopyAttributeValue(
        focusedWindow,
        kAXFocusedUIElementAttribute,
        (CFTypeRef*)&focusedElement
    );
    
    if (error != kAXErrorSuccess || !focusedElement) {
        CFRelease(focusedWindow);
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return false;
    }
    
    // Create CFString from new text
    CFStringRef newTextString = CFStringCreateWithCString(
        kCFAllocatorDefault,
        newText.c_str(),
        kCFStringEncodingUTF8
    );
    
    if (!newTextString) {
        CFRelease(focusedElement);
        CFRelease(focusedWindow);
        CFRelease(focusedApp);
        CFRelease(systemWideElement);
        return false;
    }
    
    // Set the selected text (this replaces the selection)
    // Note: Some applications use kAXValueAttribute, others use insertText action
    // We'll try both approaches
    
    // Method 1: Try to set selected text directly
    error = AXUIElementSetAttributeValue(
        focusedElement,
        kAXSelectedTextAttribute,
        newTextString
    );
    
    // Method 2: If that fails, try using insertText action
    if (error != kAXErrorSuccess) {
        // Get the selected text range first
        CFTypeRef selectedTextRange = nullptr;
        AXUIElementCopyAttributeValue(
            focusedElement,
            kAXSelectedTextRangeAttribute,
            &selectedTextRange
        );
        
        if (selectedTextRange) {
            // Try to perform insertText action
            // Note: This is a simplified approach - full implementation would
            // require deleting selected text and inserting new text
            // For now, we'll use keyboard simulation as fallback
            
            CFRelease(selectedTextRange);
        }
    }
    
    CFRelease(newTextString);
    CFRelease(focusedElement);
    CFRelease(focusedWindow);
    CFRelease(focusedApp);
    CFRelease(systemWideElement);
    
    // If direct API doesn't work, return false to trigger fallback
    // The main process will use keyboard simulation as fallback
    return error == kAXErrorSuccess;
}

// NAPI wrapper for getSelectedText
Napi::String GetSelectedText(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string selectedText = getSelectedText();
    return Napi::String::New(env, selectedText);
}

// NAPI wrapper for replaceSelectedText
Napi::Boolean ReplaceSelectedText(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "Expected string argument").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    
    std::string newText = info[0].As<Napi::String>().Utf8Value();
    bool success = replaceSelectedText(newText);
    return Napi::Boolean::New(env, success);
}

// NAPI wrapper for hasAccessibilityPermissions
Napi::Boolean HasAccessibilityPermissions(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    bool hasPermissions = hasAccessibilityPermissions();
    return Napi::Boolean::New(env, hasPermissions);
}

// Initialize the module
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "getSelectedText"),
        Napi::Function::New(env, GetSelectedText)
    );
    exports.Set(
        Napi::String::New(env, "replaceSelectedText"),
        Napi::Function::New(env, ReplaceSelectedText)
    );
    exports.Set(
        Napi::String::New(env, "hasAccessibilityPermissions"),
        Napi::Function::New(env, HasAccessibilityPermissions)
    );
    return exports;
}

NODE_API_MODULE(textBridge, Init)

