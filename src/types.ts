/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  uuid: string;
  display: string;
  identifiers: { identifier: string; display: string }[];
}

export interface Vital {
  uuid: string;
  display: string;
  value: string;
  unit: string;
  date: string;
}

export interface Appointment {
  id: string;
  provider: string;
  time: string;
  type: string;
  status: 'scheduled' | 'active' | 'completed';
}

export const OPENMRS_BASE_URL = 'https://zaphis.zsolu.com/openmrs/ws/rest/v1';
export const JITSI_BASE_URL = 'https://meet.jit.si';

export function generateJitsiRoomName(appointmentId: string): string {
  // In production, this would be a hash or a UUID mapped to the appointment
  // but obfuscated for privacy.
  return `HealthConnect-${btoa(appointmentId).substring(0, 12)}`;
}
