# Technical Requirement Document: HealthConnect Mobile App

## 1. Project Overview
A secure, HIPAA-compliant mobile application that bridges patients with the OpenMRS EMR system and provides integrated telemedicine through Jitsi Meet.

## 2. Suggested Tech Stack
### Mobile Frontend
- **Framework:** Flutter (preferred for high-performance UI) or React Native.
- **State Management:** BLoC (Flutter) or TanStack Query (React Native).
- **Offline Storage:** Hive (Flutter) or MMKV (RN) for patient record caching.

### Backend Integrations
- **EMR:** OpenMRS REST/FHIR API.
- **Video:** Jitsi Meet SDK (Native integration).
- **Push Notifications:** Firebase Cloud Messaging (FCM).

---

## 3. Key Feature Specifications

### 3.1 Authentication
- **Mechanism:** OAuth2 with OpenMRS as the Identity Provider.
- **Biometrics:** Integration with Local Authenication (FaceID/Fingerprint) to unlock the app session without re-entering passwords.

### 3.2 Patient Dashboard (EMR Sync)
- **Vitals:** Real-time lookup of `v1/obs` filtered by concept UUIDs (Blood Pressure, Weight, Heart Rate).
- **History:** Encounter-based timeline view.

### 3.3 Telemedicine Workflow
- **Room Logic:** Dynamically generated UUID room names based on `appointment_id`.
- **JWT Security:** Use a backend proxy to generate Jitsi JWT tokens containing the user's role and display name to prevent unauthorized access.

---

## 4. Code Snippet: Jitsi Initialization (Dart/Flutter)

```dart
// Flutter implementation using jitsi_meet_flutter_sdk
import 'package:jitsi_meet_flutter_sdk/jitsi_meet_flutter_sdk.dart';

class TelehealthService {
  void joinMeeting(String appointmentId, String patientName) {
    // Generate obfuscated room name from Appointment ID
    String roomName = "HC-${appointmentId.hashCode}";
    
    var options = JitsiMeetConferenceOptions(
      room: roomName,
      configOverrides: {
        "prejoinPageEnabled": false,
        "startWithAudioMuted": true,
        "startWithVideoMuted": false,
      },
      featureFlags: {
        "unsecure-meeting-indicator.enabled": false,
        "ios.screensharing.enabled": true,
      },
      userInfo: JitsiMeetUserInfo(
        displayName: patientName,
        email: "patient@example.com",
      ),
    );

    var jitsiMeet = JitsiMeet();
    jitsiMeet.join(options);
  }
}
```

## 5. Security & Compliance
- **Data in Transit:** TLS 1.3 for all API calls.
- **Data at Rest:** AES-256 encryption for cached EMR data on device.
- **No Persistence:** Video/Audio streams are never stored on device.
