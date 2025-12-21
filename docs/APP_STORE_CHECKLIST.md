# App Store Submission Checklist

Use this checklist when preparing SnapFix for App Store submission.

## Pre-Submission

### Code & Build
- [ ] App builds successfully with `npm run build:mas`
- [ ] No console errors or warnings
- [ ] App version number updated in `package.json`
- [ ] Build number incremented (if resubmitting)

### Functionality
- [ ] App works in sandboxed environment
- [ ] Clipboard functionality works (accessibility APIs won't work)
- [ ] API key configuration works
- [ ] All features tested in sandboxed build

### Legal & Privacy
- [ ] Privacy policy URL set in App Store Connect
- [ ] Terms of service URL set (if applicable)
- [ ] Export compliance questions answered
- [ ] App uses encryption? (Answer: Yes, for API calls)

### Assets
- [ ] App icon (1024x1024 PNG, no transparency)
- [ ] Screenshots for all required sizes:
  - [ ] 6.5" display (iPhone 14 Pro Max) - 1290 x 2796
  - [ ] 6.7" display (iPhone 14 Plus) - 1284 x 2778
  - [ ] 5.5" display (iPhone 8 Plus) - 1242 x 2208
- [ ] App preview video (optional but recommended)
- [ ] Description (up to 4000 characters)
- [ ] Keywords (up to 100 characters)
- [ ] Support URL
- [ ] Marketing URL (optional)

### App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] Bundle ID matches: `com.snapfix.app`
- [ ] App name: "SnapFix"
- [ ] Category: Productivity
- [ ] Age rating completed
- [ ] Pricing set (Free or Paid)
- [ ] Availability countries selected

### Metadata
- [ ] App name (30 characters max)
- [ ] Subtitle (30 characters max)
- [ ] Description (4000 characters max)
- [ ] Keywords (100 characters max)
- [ ] Promotional text (170 characters max, optional)
- [ ] What's New (4000 characters max, for updates)

## Submission

### Upload
- [ ] Build uploaded via Transporter or Xcode
- [ ] Build processed successfully (check App Store Connect)
- [ ] Correct build version selected

### Review Information
- [ ] Contact information provided
- [ ] Demo account credentials (if needed)
- [ ] Notes for reviewer:
  - Explain that app requires Gemini API key
  - Explain clipboard-only functionality in App Store version
  - Provide test instructions

### Submit
- [ ] All required fields completed
- [ ] Export compliance answered
- [ ] Content rights confirmed
- [ ] Advertising identifier (if used)
- [ ] Click "Submit for Review"

## Post-Submission

### While Waiting
- [ ] Monitor App Store Connect for status updates
- [ ] Respond promptly to any reviewer questions
- [ ] Check email for notifications

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Address all issues mentioned
- [ ] Update app if needed
- [ ] Resubmit with explanation

### After Approval
- [ ] App appears in App Store
- [ ] Test download and installation
- [ ] Monitor user reviews
- [ ] Prepare for updates

## Important Notes

### App Store Limitations
⚠️ **The App Store version has reduced functionality:**
- No accessibility APIs (sandbox restriction)
- No automatic text replacement
- Clipboard-only workflow
- Users must manually copy/paste

**Consider:**
- Clearly stating this limitation in app description
- Offering direct download version for full functionality
- Providing clear instructions for clipboard workflow

### Common Rejection Reasons
1. **Missing functionality**: App doesn't work without API key
   - **Solution**: Provide clear onboarding and instructions

2. **Privacy concerns**: App sends data to external API
   - **Solution**: Clear privacy policy explaining data usage

3. **Incomplete metadata**: Missing screenshots or description
   - **Solution**: Complete all required fields

4. **Guideline violations**: Check App Store Review Guidelines
   - **Solution**: Review guidelines and ensure compliance

## Resources

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

