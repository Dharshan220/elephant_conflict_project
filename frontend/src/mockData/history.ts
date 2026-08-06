import type { Detection } from '../types'
import { minutesAgo, hoursAgo, daysAgo } from '../utils/format'

export function genHistory(): Detection[] {
  const rows: Array<Array<string | number | null>> = [
    ['det-1041', 'esp-02', 'z2', 'Elephant herd', 0.96, 3, 2, 1, 'Moving', 'Field → Forest', minutesAgo(4)],
    ['det-1040', 'esp-06', 'z5', 'Adult elephant', 0.93, 1, 1, 0, 'Standing', 'Near village gate', minutesAgo(16)],
    ['det-1039', 'esp-04', 'z3', 'Elephant herd', 0.91, 4, 4, 0, 'Moving', 'Parallel to railway', minutesAgo(38)],
    ['det-1038', 'esp-03', 'z2', 'Adult elephant', 0.88, 1, 1, 0, 'Running', 'Escaping deterrent', minutesAgo(45)],
    ['det-1037', 'esp-09', 'z2', 'Adult elephant', 0.84, 1, 1, 0, 'Returning to Forest', 'Leaving fields', minutesAgo(70)],
    ['det-1036', 'esp-05', 'z4', 'Juvenile elephant', 0.79, 1, 0, 1, 'Standing', 'Estate edge', hoursAgo(2)],
    ['det-1035', 'esp-01', 'z1', 'Elephant herd', 0.9, 5, 4, 1, 'Moving', 'Corridor transit', hoursAgo(2)],
    ['det-1034', 'esp-10', 'z3', 'Adult elephant', 0.86, 1, 1, 0, 'Grazing', 'Coffee estate fringe', hoursAgo(3)],
    ['det-1033', 'esp-06', 'z5', 'Adult elephant', 0.89, 1, 1, 0, 'Moving', 'Canal bund approach', hoursAgo(4)],
    ['det-1032', 'esp-02', 'z2', 'Elephant herd', 0.95, 6, 5, 1, 'Grazing', 'Maize field 40m from hut', hoursAgo(5)],
    ['det-1031', 'esp-05', 'z4', 'Adult elephant', 0.82, 1, 1, 0, 'Standing', 'Tea estate boundary', hoursAgo(6)],
    ['det-1030', 'esp-04', 'z3', 'Elephant herd', 0.92, 3, 2, 1, 'Moving', 'Rail track crossing', hoursAgo(7)],
    ['det-1029', 'esp-08', 'z1', 'Adult elephant', 0.85, 1, 1, 0, 'Moving', 'South fence line', hoursAgo(8)],
    ['det-1028', 'esp-06', 'z5', 'Elephant herd', 0.9, 4, 3, 1, 'Grazing', 'Orchard edge', hoursAgo(9)],
    ['det-1027', 'esp-03', 'z2', 'Adult elephant', 0.87, 1, 1, 0, 'Returning to Forest', 'Post-raid exit', hoursAgo(10)],
    ['det-1026', 'esp-01', 'z1', 'Elephant herd', 0.94, 2, 2, 0, 'Moving', 'Corridor night pass', hoursAgo(11)],
    ['det-1025', 'esp-10', 'z3', 'Adult elephant', 0.8, 1, 1, 0, 'Standing', 'Highway culvert', hoursAgo(12)],
    ['det-1024', 'esp-09', 'z2', 'Elephant herd', 0.93, 3, 3, 0, 'Moving', 'Settlement approach', hoursAgo(13)],
    ['det-1023', 'esp-05', 'z4', 'Adult elephant', 0.81, 1, 1, 0, 'Standing', 'Estate water tank', hoursAgo(15)],
    ['det-1022', 'esp-06', 'z5', 'Elephant herd', 0.97, 5, 4, 1, 'Grazing', 'Field edge – excreta near bund', hoursAgo(16)],
    ['det-1021', 'esp-02', 'z2', 'Adult elephant', 0.86, 1, 1, 0, 'Moving', 'Night transit', hoursAgo(18)],
    ['det-1020', 'esp-04', 'z3', 'Elephant herd', 0.9, 2, 2, 0, 'Moving', 'Ridge line', hoursAgo(20)],
    ['det-1019', 'esp-08', 'z1', 'Adult elephant', 0.84, 1, 1, 0, 'Standing', 'Waterhole check', daysAgo(1)],
    ['det-1018', 'esp-06', 'z5', 'Elephant herd', 0.95, 6, 5, 1, 'Moving', 'Village bypass attempted', daysAgo(1)],
    ['det-1017', 'esp-03', 'z2', 'Adult elephant', 0.83, 1, 1, 0, 'Returning to Forest', 'Dawn retreat', daysAgo(1)],
    ['det-1016', 'esp-01', 'z1', 'Elephant herd', 0.89, 3, 2, 1, 'Grazing', 'Corridor meadow', daysAgo(2)],
  ]
  return rows.map((r, i) => ({
    id: String(r[0]),
    deviceId: String(r[1]),
    zoneId: String(r[2]),
    animalClass: String(r[3]),
    confidence: Number(r[4]),
    count: Number(r[5]),
    adults: Number(r[6]),
    calves: Number(r[7]),
    behavior: String(r[8]),
    direction: String(r[9]),
    timestamp: String(r[10]),
    imageUrl: null,
    markedSafe: i === 6 || i === 20,
  }))
}