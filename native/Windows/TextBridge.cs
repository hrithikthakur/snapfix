using System;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Automation;
using System.Windows.Automation.Text;

namespace TextBridge
{
    public class TextBridgeNative
    {
        // Check if we can access UI Automation
        public static bool HasAccessibilityPermissions()
        {
            try
            {
                AutomationElement rootElement = AutomationElement.RootElement;
                return rootElement != null;
            }
            catch
            {
                return false;
            }
        }

        // Get the currently selected text from the focused application
        public static string GetSelectedText()
        {
            try
            {
                // Get the focused element
                AutomationElement focusedElement = AutomationElement.FocusedElement;
                
                if (focusedElement == null)
                {
                    return "";
                }

                // Check if the element supports Text pattern
                object patternObj;
                if (focusedElement.TryGetCurrentPattern(TextPattern.Pattern, out patternObj))
                {
                    TextPattern textPattern = patternObj as TextPattern;
                    if (textPattern != null)
                    {
                        // Get selected text ranges
                        TextPatternRange[] selectedRanges = textPattern.GetSelection();
                        
                        if (selectedRanges != null && selectedRanges.Length > 0)
                        {
                            // Get text from the first selected range
                            string selectedText = selectedRanges[0].GetText(-1);
                            return selectedText ?? "";
                        }
                    }
                }

                // Fallback: Try to get selected text using Value pattern
                object valuePatternObj;
                if (focusedElement.TryGetCurrentPattern(ValuePattern.Pattern, out valuePatternObj))
                {
                    ValuePattern valuePattern = valuePatternObj as ValuePattern;
                    if (valuePattern != null)
                    {
                        // For Value pattern, we need to get the entire value
                        // and then determine selection (this is a limitation)
                        string value = valuePattern.Current.Value;
                        
                        // Note: TextSelectionPattern is not always available
                        // The TextPattern.GetSelection() method should work for most cases
                    }
                }

                return "";
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error getting selected text: {ex.Message}");
                return "";
            }
        }

        // Replace the selected text with new text
        public static bool ReplaceSelectedText(string newText)
        {
            try
            {
                // Get the focused element
                AutomationElement focusedElement = AutomationElement.FocusedElement;
                
                if (focusedElement == null)
                {
                    return false;
                }

                // Try to use Text pattern for text manipulation
                object patternObj;
                if (focusedElement.TryGetCurrentPattern(TextPattern.Pattern, out patternObj))
                {
                    TextPattern textPattern = patternObj as TextPattern;
                    if (textPattern != null)
                    {
                        // Get selected text ranges
                        TextPatternRange[] selectedRanges = textPattern.GetSelection();
                        
                        if (selectedRanges != null && selectedRanges.Length > 0)
                        {
                            // Replace the selected text
                            selectedRanges[0].SetText(newText);
                            return true;
                        }
                    }
                }

                // If TextPattern doesn't work, we can't replace text directly
                // The calling code will fall back to clipboard method

                // If UI Automation doesn't work, return false to trigger fallback
                return false;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"Error replacing selected text: {ex.Message}");
                return false;
            }
        }

        // Entry point for console application (for testing)
        public static int Main(string[] args)
        {
            if (args.Length == 0)
            {
                Console.WriteLine("Usage: TextBridge.exe <command> [args]");
                Console.WriteLine("Commands:");
                Console.WriteLine("  getSelectedText - Get currently selected text");
                Console.WriteLine("  replaceSelectedText <text> - Replace selected text");
                Console.WriteLine("  hasPermissions - Check if accessibility permissions are available");
                return 1;
            }

            string command = args[0];

            switch (command)
            {
                case "getSelectedText":
                    string text = GetSelectedText();
                    Console.WriteLine(text);
                    return string.IsNullOrEmpty(text) ? 1 : 0;

                case "replaceSelectedText":
                    if (args.Length < 2)
                    {
                        Console.Error.WriteLine("Error: replaceSelectedText requires text argument");
                        return 1;
                    }
                    bool success = ReplaceSelectedText(args[1]);
                    return success ? 0 : 1;

                case "hasPermissions":
                    bool hasPermissions = HasAccessibilityPermissions();
                    Console.WriteLine(hasPermissions ? "true" : "false");
                    return hasPermissions ? 0 : 1;

                default:
                    Console.Error.WriteLine($"Unknown command: {command}");
                    return 1;
            }
        }
    }
}

