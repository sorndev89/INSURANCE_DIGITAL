import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/app_widgets.dart';

class AgentTermsScreen extends StatelessWidget {
  const AgentTermsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: GreenAppBar(
        title: 'ສະໝັກອາເຈັນສິ',
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: AppPage(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: AppColors.headerGradient,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.badge_rounded, color: Colors.white, size: 34),
                        SizedBox(height: 10),
                        Text(
                          'ສາຍຝົນປະກັນພັນ',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'ຮ່ວມເປັນຕົວແທນຂາຍປະກັນໄພກັບພວກເຮົາ',
                          style: TextStyle(color: Colors.white70, fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  const Text(
                    'ຂໍ້ກຳນົດການສະໝັກເປັນອາເຈັນສິ',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'ອັບເດດຫຼ້າສຸດ: 2 / 8 / 2023',
                    style: TextStyle(fontSize: 10.5, color: AppColors.hint),
                  ),
                  const SizedBox(height: 14),
                  for (final item in const [
                    'ມີອາຍຸ 18 ປີຂຶ້ນໄປ ແລະ ມີບັດປະຈຳໂຕທີ່ຖືກຕ້ອງ',
                    'ມີຄວາມຮູ້ພື້ນຖານກ່ຽວກັບຜະລິດຕະພັນປະກັນໄພ',
                    'ມີເຄືອຂ່າຍລູກຄ້າ ຫຼື ຊ່ອງທາງການຂາຍ',
                    'ສາມາດສື່ສານພາສາລາວໄດ້ດີ',
                    'ມີຄວາມຮັບຜິດຊອບ ແລະ ປະຕິບັດຕາມຈັນຍາບັນວິຊາຊີບ',
                    'ຜ່ານການຝຶກອົບຮົມຈາກສາຍຝົນ',
                  ])
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 18,
                            height: 18,
                            margin: const EdgeInsets.only(top: 1),
                            decoration: const BoxDecoration(
                              color: AppColors.accentSoft,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check_rounded,
                              size: 12,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 9),
                          Expanded(
                            child: Text(
                              item,
                              style: const TextStyle(
                                fontSize: 12.5,
                                color: AppColors.text,
                                height: 1.6,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 8),
                  AppCard(
                    color: AppColors.mint,
                    borderColor: const Color(0xFFCDEBD8),
                    child: const Text(
                      'ຜົນປະໂຫຍດ: ຄ່າຄອມມິດຊັນແຂ່ງຂັນ, ການຝຶກອົບຮົມ, ລະບົບຈັດການລູກຄ້າ ແລະ ການສະໜັບສະໜູນຈາກທີມງານ.',
                      style: TextStyle(fontSize: 11.5, color: AppColors.muted, height: 1.65),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: PrimaryButton(
                label: 'ຕົກລົງ',
                onPressed: () => context.push('/agent/form'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
