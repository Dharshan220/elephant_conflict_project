import type { AlertItem, ActivityItem } from '../types'
import { minutesAgo, hoursAgo } from '../utils/format'

export function genAlerts(): AlertItem[] {
  return [
    { id: 'AL-0421', zoneId: 'z1', severity: 'critical', status: 'active', title: 'Herd crossing into maize field', message: '2 adults + 1 calf detected near community boundary. Buzzer activated on esp-02.', timestamp: minutesAgo(4), officerId: 'o2', deviceId: 'esp-02' },
    { id: 'AL-0420', zoneId: 'z5', severity: 'warning', status: 'acknowledged', title: 'Movement at village boundary', message: 'Solo bull elephant spotted near Village 3. Patrol dispatched.', timestamp: minutesAgo(16), officerId: 'o5', deviceId: 'esp-06' },
    { id: 'AL-0419', zoneId: 'z3', severity: 'warning', status: 'active', title: 'Crossing near railway line', message: 'Herd of 4 moving along the track. Night patrol notified.', timestamp: minutesAgo(38), officerId: 'o3', deviceId: 'esp-04' },
    { id: 'AL-0418', zoneId: 'z2', severity: 'critical', status: 'resolved', title: 'Crop raid repelled', message: 'Herd entered maize belt; deterrent driven herd back to forest by 23:10.', timestamp: minutesAgo(70), officerId: 'o2', deviceId: 'esp-03' },
    { id: 'AL-0417', zoneId: 'z4', severity: 'info', status: 'resolved', title: 'Dormant movement logged', message: 'Movement along estate boundary only; no villagers at risk.', timestamp: minutesAgo(132), officerId: 'o6', deviceId: 'esp-05' },
    { id: 'AL-0416', zoneId: 'z1', severity: 'info', status: 'acknowledged', title: 'Routine night movement', message: 'Herd used corridor without entering farmland.', timestamp: minutesAgo(205), officerId: 'o1', deviceId: 'esp-01' },
    { id: 'AL-0415', zoneId: 'z5', severity: 'warning', status: 'resolved', title: 'Orchard intrusion attempt', message: 'Elephant in orchard; horn + lights drive it back to forest.', timestamp: minutesAgo(310), officerId: 'o5', deviceId: 'esp-06' },
    { id: 'AL-0414', zoneId: 'z3', severity: 'info', status: 'resolved', title: 'Dawn corridor pass', message: 'Two bulls crossed corridor without conflict.', timestamp: hoursAgo(9), officerId: 'o1', deviceId: 'esp-10' },
    { id: 'AL-0413', zoneId: 'z2', severity: 'warning', status: 'acknowledged', title: 'Storage-shed proximity alarm', message: 'Elephant within 150 m of shed; advisory issued to watchman.', timestamp: hoursAgo(11), officerId: 'o3', deviceId: 'esp-09' },
    { id: 'AL-0412', zoneId: 'z4', severity: 'info', status: 'resolved', title: 'Tea estate night alert', message: 'Minor elephant presence; cleared after ground verification.', timestamp: hoursAgo(15), officerId: 'o6', deviceId: 'esp-05' },
  ]
}

export function genActivity(): ActivityItem[] {
  return [
    { id: 'act-1', type: 'detection', title: 'YOLOv8 confirmed elephant', description: 'Herd detected near Muthanga maize field — conf 96%', timestamp: minutesAgo(4) },
    { id: 'act-2', type: 'alert', title: 'Critical alert raised AL-0421', description: 'Buzzer + LED armed on esp-02', timestamp: minutesAgo(4) },
    { id: 'act-3', type: 'motion', title: 'PIR motion · esp-02', description: 'Triple trigger, 22 s PIR burst captured', timestamp: minutesAgo(5) },
    { id: 'act-4', type: 'patrol', title: 'Rapid response dispatched', description: 'S. Meena + RRT squad en route to Muthanga', timestamp: minutesAgo(6) },
    { id: 'act-5', type: 'ack', title: 'Alert AL-0420 acknowledged', description: 'V. Anand confirmed at Village 3', timestamp: minutesAgo(12) },
    { id: 'act-6', type: 'buzzer', title: 'Deterrent cycle completed', description: 'esp-03 buzzer cycled 120 s · LED pattern 2', timestamp: minutesAgo(30) },
    { id: 'act-7', type: 'safe', title: 'Zone z4 marked safe', description: 'K. Divya verified no herd present', timestamp: minutesAgo(92) },
    { id: 'act-8', type: 'device', title: 'esp-07 went offline', description: 'Battery low — recommend solar service', timestamp: minutesAgo(96) },
  ]
}