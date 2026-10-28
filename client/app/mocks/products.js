import { insurers } from './insurers'

const motor = (id, insurer, name, basePremium, rate, description) => ({
  id,
  companyId: insurer.id,
  companyCode: insurer.code,
  name,
  type: 'Motor',
  basePremium,
  sumInsured: basePremium * 60,
  deductible: 0,
  brokerCommissionRate: rate,
  description,
})

const other = (id, insurer, type, name, basePremium, rate, description) => ({
  id,
  companyId: insurer.id,
  companyCode: insurer.code,
  name,
  type,
  basePremium,
  sumInsured: basePremium * 40,
  deductible: 0,
  brokerCommissionRate: rate,
  description,
})

const byCode = (code) => insurers.find((insurer) => insurer.code === code)

export const products = [
  motor(1, byCode('DHP'), 'ລົດຍົນ ຊັ້ນ 1 (DHP Premium Gold)', 2500000, 25, 'ຄຸ້ມຄອງຄົບວົງຈອນ ລົດຊົນ, ລົດຫາຍ, ໄຟໄໝ້, ນ້ຳຖ້ວມ'),
  motor(2, byCode('APA'), 'ລົດຍົນ ຊັ້ນ 1 (APA Platinum)', 2350000, 22, 'ຄຸ້ມຄອງຄົບວົງຈອນ ອູ່ສ້ອມແປງມາດຕະຖານສູງ'),
  motor(3, byCode('SOK'), 'ລົດຍົນ ຊັ້ນ 1 (Soksay Smart)', 2250000, 20, 'ຄຸ້ມຄອງລົດຊົນ ແລະ ຄວາມຮັບຜິດຊອບຕໍ່ບຸກຄົນທີສາມ'),
  motor(4, byCode('LXA'), 'ລົດຍົນ ຊັ້ນ 1 (Lane Xang Gold)', 2400000, 20, 'ຄຸ້ມຄອງຄົບວົງຈອນ ພ້ອມບໍລິການຊ່ວຍເຫຼືອ 24/7'),
  motor(5, byCode('FTK'), 'ລົດຍົນ ຊັ້ນ 1 (Forte-Toko Plus)', 2300000, 18, 'ຄຸ້ມຄອງລົດຊົນ, ລົດຫາຍ, ໄຟໄໝ້'),
  motor(6, byCode('ALZ'), 'ລົດຍົນ ຊັ້ນ 1 (Allianz Drive)', 2650000, 16, 'ຄຸ້ມຄອງລະດັບສູງ ພ້ອມບໍລິການສຸກເສີນ'),
  motor(7, byCode('ZJI'), 'ລົດຍົນ ຊັ້ນ 1 (Zongji Care)', 2100000, 15, 'ຄຸ້ມຄອງຄູ່ກໍລະນີ ແລະ ລົດຕົນເອງ'),
  motor(8, byCode('NVK'), 'ລົດຍົນ ຊັ້ນ 1 (Navakij Premium)', 2200000, 15, 'ຄຸ້ມຄອງຄົບວົງຈອນ ມາດຕະຖານສູງ'),
  motor(9, byCode('LVI'), 'ລົດຍົນ ຊັ້ນ 1 (LVI Protect)', 2150000, 17, 'ຄຸ້ມຄອງລົດຊົນ ແລະ ອຸປະຕິເຫດສ່ວນບຸກຄົນ'),
  motor(10, byCode('VTE'), 'ລົດຍົນ ຊັ້ນ 1 (Vientiane Care)', 1950000, 14, 'ຄຸ້ມຄອງພື້ນຖານ ລາຄາປະຢັດ'),
  motor(11, byCode('STM'), 'ລົດຍົນ ຊັ້ນ 1 (ST Muangthai Plus)', 1850000, 13, 'ຄຸ້ມຄອງລົດຊົນ ແລະ ຄຸ້ມຄອງຜູ້ຂັບຂີ່'),
  motor(12, byCode('DHP'), 'ລົດຍົນ ຊັ້ນ 2+ (DHP Smart)', 1500000, 25, 'ຄຸ້ມຄອງລົດຊົນ, ລົດຫາຍ, ໄຟໄໝ້'),
  motor(13, byCode('APA'), 'ລົດຍົນ ຊັ້ນ 3+ (APA Eco)', 950000, 22, 'ຄຸ້ມຄອງຄູ່ກໍລະນີ ແລະ ລົດຕົນເອງ'),
  other(14, byCode('APA'), 'Health', 'ສຸຂະພາບ ຄອມຟອດ (APA Health Comfort)', 3200000, 20, 'ຄຸ້ມຄອງຜູ້ປ່ວຍ IPD ຫ້ອງດ່ຽວມາດຕະຖານ'),
  other(15, byCode('ALZ'), 'Health', 'ສຸຂະພາບ ພຣີມຽມ (Allianz Global Care)', 4800000, 15, 'ຄຸ້ມຄອງ IPD/OPD ຮອງຮັບໂຮງໝໍໃນລາວ ແລະ ໄທ'),
  other(16, byCode('DHP'), 'Health', 'ສຸຂະພາບ ແຟມິລີ (DHP Family Care)', 2900000, 18, 'ຄຸ້ມຄອງທັງຄອບຄົວ'),
  other(17, byCode('SOK'), 'Fire', 'ອັກຄີໄພ ເຮືອນ (Soksay Home)', 1800000, 20, 'ຄຸ້ມຄອງເຮືອນ ແລະ ຊັບສິນພາຍໃນ'),
  other(18, byCode('LXA'), 'Fire', 'ອັກຄີໄພ ໂຮງງານ (Lane Xang Factory)', 6500000, 21, 'ຄຸ້ມຄອງໂຮງງານ ແລະ ສາງສິນຄ້າ'),
  other(19, byCode('FTK'), 'Accident', 'ອຸບັດຕິເຫດ ສ່ວນຕົວ (Forte PA)', 450000, 16, 'ຄຸ້ມຄອງການເສຍຊີວິດ ແລະ ຄ່າປິ່ນປົວ'),
  other(20, byCode('LVI'), 'Accident', 'ອຸບັດຕິເຫດ ກຸ່ມ (LVI Group PA)', 780000, 16, 'ຄຸ້ມຄອງພະນັກງານໃນອົງກອນ'),
  other(21, byCode('STM'), 'Travel', 'ປະກັນການເດີນທາງ (ST Travel)', 350000, 11, 'ຄຸ້ມຄອງການເດີນທາງຕ່າງປະເທດ'),
  other(22, byCode('VTE'), 'Travel', 'ປະກັນການເດີນທາງ ອາຊີ (Vientiane Travel)', 280000, 12, 'ຄຸ້ມຄອງການເດີນທາງໃນອາຊີ'),
]
