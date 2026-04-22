/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Patient, Vital, Appointment } from './types';

// Mock service for demonstration
export const openmrsService = {
  getPatientData: async (patientId: string): Promise<Patient> => {
    // Simulated REST call
    return {
      uuid: patientId,
      display: 'John Doe',
      identifiers: [{ identifier: '100-1', display: 'OpenMRS ID' }]
    };
  },

  getVitals: async (patientId: string): Promise<Vital[]> => {
    return [
      { uuid: '1', display: 'Blood Pressure', value: '120/80', unit: 'mmHg', date: '2024-04-20 10:00 AM' },
      { uuid: '2', display: 'Heart Rate', value: '72', unit: 'bpm', date: '2024-04-20 10:00 AM' },
      { uuid: '3', display: 'Oxygen Saturation', value: '98', unit: '%', date: '2024-04-20 10:00 AM' },
      { uuid: '4', display: 'Body Temperature', value: '36.6', unit: '°C', date: '2024-04-20 10:00 AM' }
    ];
  },

  getAppointments: async (patientId: string): Promise<Appointment[]> => {
    return [
      { 
        id: 'appt-9921', 
        provider: 'Dr. Sarah Smith', 
        time: 'Today, 2:00 PM', 
        type: 'General Checkup', 
        status: 'active' 
      },
      { 
        id: 'appt-9922', 
        provider: 'Dr. Michael Chen', 
        time: 'Tomorrow, 10:30 AM', 
        type: 'Cardiology Follow-up', 
        status: 'scheduled' 
      }
    ];
  }
};
