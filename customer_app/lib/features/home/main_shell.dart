import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});

  final Widget child;

  static const _items = <_NavItem>[
    _NavItem('/home', 'ໜ້າຫຼັກ', Icons.home_outlined, Icons.home_rounded),
    _NavItem('/services', 'ບໍລິການ', Icons.support_agent_outlined, Icons.support_agent_rounded),
    _NavItem('/news', 'ຂ່າວສານ', Icons.campaign_outlined, Icons.campaign_rounded),
    _NavItem('/policies', 'ປະກັນໄພຂອງຂ້ອຍ', Icons.description_outlined, Icons.description_rounded),
    _NavItem('/profile', 'ຕັ້ງຄ່າ', Icons.settings_outlined, Icons.settings_rounded),
  ];

  int _indexFor(String location) {
    if (location.startsWith('/services')) return 1;
    if (location.startsWith('/news')) return 2;
    if (location.startsWith('/policies')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final index = _indexFor(location);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 66,
            child: Row(
              children: [
                for (var i = 0; i < _items.length; i++)
                  Expanded(
                    child: _NavButton(
                      item: _items[i],
                      active: i == index,
                      onTap: () => context.go(_items[i].path),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem(this.path, this.label, this.icon, this.activeIcon);

  final String path;
  final String label;
  final IconData icon;
  final IconData activeIcon;
}

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final _NavItem item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.muted;
    return InkWell(
      onTap: onTap,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: active ? AppColors.accentSoft : Colors.transparent,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Icon(active ? item.activeIcon : item.icon, size: 22, color: color),
          ),
          const SizedBox(height: 3),
          Text(
            item.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 9.5,
              fontWeight: active ? FontWeight.w800 : FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
