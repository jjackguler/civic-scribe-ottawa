# The Brief for iPhone and iPad

The existing installable PWA remains at https://app.aibroadsheet.com/app. The iOS target is a SwiftUI reader, not a website wrapper. It has topic circles, native source/detail screens, system sharing, on-device bookmarks with offline text, and a paged AVKit video feed. Playback requires a tap and pauses when the app leaves the foreground. It includes no advertising SDK, tracking SDK, login, purchases or user-generated content.

## Reproducible simulator build

On a Mac with Xcode and XcodeGen:

```sh
mkdir -p ios/TheBrief/Assets.xcassets/AppIcon.appiconset
sips -z 1024 1024 public/brief/icon-512.png --out ios/TheBrief/Assets.xcassets/AppIcon.appiconset/icon.png
cd ios
xcodegen generate
open TheBrief.xcodeproj
```

The `Build and test Brief iOS` workflow builds an unsigned simulator app and runs persistence/security tests. A simulator artifact is not an installable iPhone IPA or a TestFlight release. The feed endpoint `/api/brief.json` shares the same publishability filters, sources, caveats and AI labels as the PWA. Offline images/video are not promised; saved text and links remain available.

## Before TestFlight / App Store

1. Confirm active paid Apple Developer Program membership, team and agreements. A free developer profile is insufficient.
2. Register `com.aibroadsheet.brief`, create the App Store Connect app, and set the real development team in Xcode signing. Do not commit certificates, provisioning profiles, API keys or passwords.
3. Archive for a real iOS device with distribution signing, validate and upload through Xcode/Transporter or a separately authorized signing workflow.
4. Test actual iPhone and iPad: large text/VoiceOver, video and audio lifecycle, poor network, offline saved stories, source links, screenshots, rotation and content reporting.
5. Complete age rating based on the live editorial feed, export compliance, content rights, territories, privacy disclosures and review notes. Do not select Made for Kids. Native app network requests can generate host logs; audit the actual backend and media hosts before declaring App Privacy answers. The bundled manifest declares no tracking or required-reason APIs in this code; it is not a substitute for this audit.
6. Complete internal TestFlight testing, then request App Review. Approval is Apple's decision. No ad SDK or ad revenue is enabled by this native preparation.

## Store copy draft

- Name: The Brief — AI Broadsheet
- Subtitle: AI news. Human stakes.
- Primary category: News
- Keywords: artificial intelligence,AI,news,technology,explainers,research
- Support: https://aibroadsheet.com/corrections
- Marketing: https://aibroadsheet.com
- Privacy: https://aibroadsheet.com/privacy

Description: Understand the AI stories behind the scroll. The Brief combines short explanations, visual stories and original videos with named sources, context and caveats. Browse by topic, save briefs for offline reading, share stories and inspect the evidence behind each headline. AI-assisted journalism with human editorial responsibility from AI Broadsheet. Saved text stays on your device; images and videos need an internet connection.

Review notes: No login is required. Feed content loads from app.aibroadsheet.com. Use the Brief tab to read sources, Watch for tap-to-play videos, and Saved for offline text. There are no in-app purchases, ads or user accounts in this build.
