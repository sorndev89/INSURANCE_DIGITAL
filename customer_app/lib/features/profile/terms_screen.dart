import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: AppPage(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text(
              'ເງື່ອນໄຂການໃຊ້ບໍລິການ',
              style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
            ),
            SizedBox(height: 6),
            Text(
              'ອັບເດດຫຼ້າສຸດ: 27/10/2026',
              style: TextStyle(fontSize: 11, color: AppColors.hint),
            ),
            SizedBox(height: 18),
            _TermSection(
              title: '1. ການຍອມຮັບເງື່ອນໄຂ',
              body:
                  'ເມື່ອທ່ານສ້າງບັນຊີ ແລະ ໃຊ້ບໍລິການ SAIYFON INSURANCE DIGITAL ທ່ານຕົກລົງປະຕິບັດຕາມເງື່ອນໄຂ ແລະ ຂໍ້ກຳນົດທັງໝົດທີ່ລະບຸໄວ້ໃນເອກະສານນີ້.',
            ),
            _TermSection(
              title: '2. ບໍລິການນາຍໜ້າປະກັນໄພ',
              body:
                  'ບໍລິສັດ ສາຍຝົນ ນາຍໜ້າປະກັນໄພ ເຮັດໜ້າທີ່ເປັນຕົວແທນໃນການສະເໜີ ແລະ ອຳນວຍຄວາມສະດວກໃນການຊື້ປະກັນໄພ. ສັນຍາປະກັນໄພເປັນຂອງບໍລິສັດປະກັນໄພຄູ່ຮ່ວມແຕ່ລະແຫ່ງ.',
            ),
            _TermSection(
              title: '3. ຄວາມຖືກຕ້ອງຂອງຂໍ້ມູນ',
              body:
                  'ຜູ້ໃຊ້ຕ້ອງສະໜອງຂໍ້ມູນສ່ວນຕົວ ເອກະສານຢັ້ງຢືນ ແລະ ຂໍ້ມູນລົດທີ່ຖືກຕ້ອງ ແລະ ເປັນຄວາມຈິງ. ຂໍ້ມູນທີ່ບໍ່ຖືກຕ້ອງອາດສົ່ງຜົນຕໍ່ການຄຸ້ມຄອງ ແລະ ການຊຳລະສິນໄປ.',
            ),
            _TermSection(
              title: '4. ການຊຳລະເງິນ',
              body:
                  'ການຊຳລະຜ່ານ BCEL One ຫຼື ຊ່ອງທາງທີ່ລະບົບກຳນົດ ຈະຖືວ່າສຳເລັດເມື່ອໄດ້ຮັບການຢືນຢັນຈາກຜູ້ໃຫ້ບໍລິການຊຳລະເງິນ.',
            ),
            _TermSection(
              title: '5. ການຄຸ້ມຄອງຂໍ້ມູນສ່ວນຕົວ',
              body:
                  'ຂໍ້ມູນຂອງທ່ານຈະຖືກເກັບຮັກສາ ແລະ ນຳໃຊ້ເພື່ອການບໍລິການປະກັນໄພເທົ່ານັ້ນ. ພວກເຮົາຈະບໍ່ເປີດເຜີຍຂໍ້ມູນຕໍ່ບຸກຄົນທີສາມ ເວັ້ນເສຍແຕ່ໄດ້ຮັບການຍິນຍອມ ຫຼື ເປັນໄປຕາມກົດໝາຍ.',
            ),
            _TermSection(
              title: '6. ການຕິດຕໍ່',
              body:
                  'ຫາກມີຄຳຖາມ ກະລຸນາຕິດຕໍ່ 021 633 222 ຫຼື 030 5054 234. ເອກະສານສະບັບນີ້ອາດມີການປັບປຸງໂດຍບໍ່ແຈ້ງລ່ວງໜ້າ.',
            ),
          ],
        ),
      ),
    );
  }
}

class _TermSection extends StatelessWidget {
  const _TermSection({required this.title, required this.body});

  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(
            body,
            style: const TextStyle(fontSize: 12.5, color: AppColors.muted, height: 1.75),
          ),
        ],
      ),
    );
  }
}
