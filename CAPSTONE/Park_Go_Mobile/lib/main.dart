import 'package:flutter/material.dart';
import 'dart:async';
import 'package:url_launcher/url_launcher.dart';

// ═══════════════════════════════════════════════════════════════
//  STATIO NEXUS — LIGHT THEME LOGIN + FULL APP (with Splash Screen)
// ═══════════════════════════════════════════════════════════════

const _bgLight = Color(0xFFF1F5F9);
const _bgWhite = Color(0xFFFFFFFF);
const _bgInput = Color(0xFFF8FAFC);
const _accentBlue = Color(0xFF0284C7);
const _accentBlueLight = Color(0xFF0EA5E9);
const _accentEmerald = Color(0xFF10B981);
const _accentRose = Color(0xFFEF4444);
const _textPrimary = Color(0xFF1E293B);
const _textSecondary = Color(0xFF64748B);
const _textMuted = Color(0xFF94A3B8);
const _borderLight = Color(0xFFE2E8F0);
const _borderInput = Color(0xFFCBD5E1);

void main() => runApp(const ParkAndGoApp());

class ParkAndGoApp extends StatelessWidget {
  const ParkAndGoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Statio Nexus',
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: _bgLight,
        useMaterial3: true,
        colorScheme: const ColorScheme.light(
          primary: _accentBlue,
          secondary: _accentEmerald,
          surface: _bgWhite,
          background: _bgLight,
          error: _accentRose,
          onSurface: _textPrimary,
        ),
      ),
      home: const ParkAndGoShell(),
    );
  }
}

class SelectArea extends StatelessWidget {
  const SelectArea({super.key, this.reservedSlots = const [], this.onReserveSuccess, this.allReservations = const [], this.onEarlyLeave});
  final List<String> reservedSlots;
  final Function(Map<String, dynamic>)? onReserveSuccess;
  final List<Map<String, dynamic>> allReservations;
  final Function(String slot)? onEarlyLeave;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CROSSROAD PARK T.S.', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: _bgWhite,
        foregroundColor: _textPrimary,
        elevation: 0,
      ),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        // Full-width map image (place your map image at assets/mall.jpg)
        Container(
          height: 360,
          clipBehavior: Clip.hardEdge,
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
          child: Image.asset('assets/mall.jpg', fit: BoxFit.cover, alignment: Alignment.center),
        ),
        const SizedBox(height: 18),
        const Align(
          alignment: Alignment.centerLeft,
          child: Text('Select Area',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: _textPrimary)),
        ),
        const SizedBox(height: 12),
        // Grid of area buttons (Area 1..8)
        GridView.count(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: 3.2,
          children: List.generate(8, (i) {
            final label = 'Area ${i + 1}';
            final isComingSoon = i == 7; // Area 8 is coming soon
            // Find all reservations for this area
            final areaReservations = allReservations
                .where((r) => r['area'] == label)
                .toList();
            return GestureDetector(
              onTap: isComingSoon ? null : () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => SelectSlot(
                      area: label,
                      reservedSlots: reservedSlots,
                      onReserveSuccess: onReserveSuccess,
                      areaReservations: areaReservations,
                      onEarlyLeave: onEarlyLeave,
                    ),
                  ),
                );
              },
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isComingSoon ? _textMuted.withOpacity(0.15) : _accentBlue,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isComingSoon ? _textMuted : _accentBlue,
                    width: 2,
                  ),
                ),
                child: Text(isComingSoon ? 'COMING SOON' : label,
                    style: TextStyle(
                        fontSize: isComingSoon ? 12 : 16,
                        fontWeight: FontWeight.w700,
                        color: isComingSoon ? _textMuted : _bgWhite)),
              ),
            );
          }),
        ),
        const SizedBox(height: 8),
      ]),
    );
  }
}

class SelectSlot extends StatefulWidget {
  const SelectSlot({
    super.key, 
    required this.area, 
    this.reservedSlots = const [], 
    this.onReserveSuccess,
    this.areaReservations = const [],
    this.onEarlyLeave,
  });
  final String area;
  final List<String> reservedSlots;
  final Function(Map<String, dynamic>)? onReserveSuccess;
  final List<Map<String, dynamic>> areaReservations;
  final Function(String slot)? onEarlyLeave;

  @override
  State<SelectSlot> createState() => _SelectSlotState();
}

class _SelectSlotState extends State<SelectSlot> {
  late Set<String> _selectedSlots;
  DateTime _date = DateTime.now();
  TimeOfDay _time = TimeOfDay.now();
  Set<String> _reservedSlots = {};
  late Timer _elapsedTimer;
  int _currentImagePage = 0;

  @override
  void initState() {
    super.initState();
    _selectedSlots = {};
    // Load all reserved slots for this area from parent
    _loadAreaReservations();
    _elapsedTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      // Timer for elapsed time updates if needed
    });
  }

  void _loadAreaReservations() {
    setState(() {
      final areaReserved = widget.areaReservations
          .map((r) => r['slot'] as String? ?? '')
          .where((s) => s.isNotEmpty)
          .toSet();
      // Merge with locally reserved slots to avoid losing them
      _reservedSlots.addAll(areaReserved);
    });
  }

  @override
  void didUpdateWidget(SelectSlot oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reset carousel page when switching areas
    if (oldWidget.area != widget.area) {
      _currentImagePage = 0;
    }
    // Always sync with parent's reservations to avoid losing data
    _loadAreaReservations();
  }

  @override
  void dispose() {
    _elapsedTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Generate slots based on area
    late List<String> slots;
    late String areaImage;
    
    if (widget.area == 'Area 2') {
      slots = List.generate(7, (i) => 'S${i + 25}');
      areaImage = 'assets/Area 2.jpg';
    } else if (widget.area == 'Area 3') {
      slots = List.generate(8, (i) => 'S${i + 32}');
      areaImage = 'assets/Area 3.jpg';
    } else if (widget.area == 'Area 4') {
      slots = List.generate(7, (i) => 'S${i + 40}');
      areaImage = 'assets/Area 4.jpg';
    } else if (widget.area == 'Area 5') {
      slots = List.generate(21, (i) => 'S${i + 47}');
      areaImage = 'assets/Area 5.jpg';
    } else if (widget.area == 'Area 6') {
      slots = List.generate(8, (i) => 'S${i + 68}');
      areaImage = 'assets/Area 6.jpg';
    } else if (widget.area == 'Area 7') {
      slots = List.generate(8, (i) => 'S${i + 76}');
      areaImage = 'assets/Area 7.jpg';
    } else {
      slots = List.generate(24, (i) => 'S${i + 1}');
      areaImage = 'assets/Area 1.jpg';
    }
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Select Slot - ${widget.area}'),
        backgroundColor: _bgWhite,
        foregroundColor: _textPrimary,
        elevation: 0,
      ),
      body: ListView(
        children: [
          // Area image carousel for Area 1-7, single image for others
          if (widget.area == 'Area 1' || widget.area == 'Area 2' || widget.area == 'Area 3' || widget.area == 'Area 4' || widget.area == 'Area 5' || widget.area == 'Area 6' || widget.area == 'Area 7')
            Stack(
              alignment: Alignment.bottomCenter,
              children: [
                SizedBox(
                  width: double.infinity,
                  height: 300,
                  child: PageView(
                    onPageChanged: (page) => setState(() => _currentImagePage = page),
                    children: widget.area == 'Area 1'
                        ? [
                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/1.jpg', fit: BoxFit.contain)),
                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/2.jpg', fit: BoxFit.contain)),
                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/3.jpg', fit: BoxFit.contain)),
                          ]
                        : widget.area == 'Area 2'
                            ? [
                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/4.jpg', fit: BoxFit.contain)),
                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/5.jpg', fit: BoxFit.contain)),
                              ]
                            : widget.area == 'Area 3'
                                ? [
                                    Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/6.jpg', fit: BoxFit.contain)),
                                    Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/7.jpg', fit: BoxFit.contain)),
                                    Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/8.jpg', fit: BoxFit.contain)),
                                    Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/9.jpg', fit: BoxFit.contain)),
                                  ]
                                : widget.area == 'Area 4'
                                    ? [
                                        Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/10.jpg', fit: BoxFit.contain)),
                                        Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/11.jpg', fit: BoxFit.contain)),
                                      ]
                                    : widget.area == 'Area 5'
                                        ? [
                                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/12.jpg', fit: BoxFit.contain)),
                                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/13.jpg', fit: BoxFit.contain)),
                                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/14.jpg', fit: BoxFit.contain)),
                                            Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/15.jpg', fit: BoxFit.contain)),
                                          ]
                                        : widget.area == 'Area 6'
                                            ? [
                                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/16.jpg', fit: BoxFit.contain)),
                                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/17.jpg', fit: BoxFit.contain)),
                                              ]
                                            : [
                                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/18.jpg', fit: BoxFit.contain)),
                                                Container(clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/19.jpg', fit: BoxFit.contain)),
                                              ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                        widget.area == 'Area 1'
                            ? 3
                            : widget.area == 'Area 2'
                                ? 2
                                : widget.area == 'Area 3'
                                    ? 4
                                    : widget.area == 'Area 4'
                                        ? 2
                                        : widget.area == 'Area 5'
                                            ? 4
                                            : widget.area == 'Area 6'
                                                ? 2
                                                : 2,
                        (index) => Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: Container(
                            width: _currentImagePage == index ? 24 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: _currentImagePage == index ? _accentBlue : _textMuted.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        )),
                  ),
                ),
              ],
            ),
          if (widget.area == 'Area 1')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 1.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 2')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 2.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 3')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 3.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 4')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 4.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 5')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 5.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 6')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 6.jpg', fit: BoxFit.contain))
          else if (widget.area == 'Area 7')
            Container(width: double.infinity, height: 200, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset('assets/Area 7.jpg', fit: BoxFit.contain))
          else
            Container(width: double.infinity, height: 300, clipBehavior: Clip.hardEdge, decoration: BoxDecoration(borderRadius: BorderRadius.circular(0)), child: Image.asset(areaImage, fit: BoxFit.contain)),
          // Slot selection
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Select slots to reserve', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    if (_selectedSlots.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _accentEmerald.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text('${_selectedSlots.length} selected', style: const TextStyle(fontSize: 12, color: _accentEmerald, fontWeight: FontWeight.w600)),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                GridView.count(
                  crossAxisCount: 6,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  children: slots.map((s) => GestureDetector(
                    onTap: ((_reservedSlots.contains(s) || widget.reservedSlots.contains(s)) ? null : (() {
                      setState(() {
                        if (_selectedSlots.contains(s)) {
                          _selectedSlots.remove(s);
                        } else {
                          _selectedSlots.add(s);
                        }
                      });
                    })),
                    child: Container(
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: _selectedSlots.contains(s)
                            ? _accentEmerald
                            : (_reservedSlots.contains(s) || widget.reservedSlots.contains(s))
                                ? _textMuted.withOpacity(0.2)
                                : _bgLight,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _selectedSlots.contains(s)
                              ? _accentEmerald
                              : (_reservedSlots.contains(s) || widget.reservedSlots.contains(s))
                                  ? _textMuted
                                  : _borderLight,
                          width: 1.5,
                        ),
                        boxShadow: _selectedSlots.contains(s) ? [BoxShadow(color: _accentEmerald.withOpacity(0.3), blurRadius: 8, spreadRadius: 2)] : [],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(s,
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: _selectedSlots.contains(s)
                                    ? _bgWhite
                                    : (_reservedSlots.contains(s) || widget.reservedSlots.contains(s))
                                        ? _textMuted
                                        : _textPrimary,
                              )),
                          if (_reservedSlots.contains(s) || widget.reservedSlots.contains(s))
                            Text('Reserved',
                                style: TextStyle(
                                  fontSize: 8,
                                  color: _textMuted,
                                  fontWeight: FontWeight.w600,
                                )),
                          if (_selectedSlots.contains(s))
                            Text('✓',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: _bgWhite,
                                  fontWeight: FontWeight.w600,
                                )),
                        ],
                      ),
                    ),
                  )).toList(),
                ),
                const SizedBox(height: 24),
                // Schedule section
                const Text('Schedule', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: _date,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 30)),
                          );
                          if (picked != null) setState(() => _date = picked);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          decoration: BoxDecoration(
                            border: Border.all(color: _borderLight),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Date', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text('${_date.year}-${_date.month.toString().padLeft(2, '0')}-${_date.day.toString().padLeft(2, '0')}',
                                  style: const TextStyle(fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GestureDetector(
                        onTap: () async {
                          final picked = await showTimePicker(
                            context: context,
                            initialTime: _time,
                          );
                          if (picked != null) setState(() => _time = picked);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                          decoration: BoxDecoration(
                            border: Border.all(color: _borderLight),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Time', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text('${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}',
                                  style: const TextStyle(fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Action buttons
                if (_selectedSlots.isNotEmpty) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton(
                      onPressed: () {
                        final amountCtrl = TextEditingController();
                        showDialog(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Payment'),
                            content: SingleChildScrollView(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Select Payment Method:', style: TextStyle(fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 16),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: _accentBlue.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: _accentBlue, width: 2),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.payment_rounded, color: _accentBlue),
                                        const SizedBox(width: 12),
                                        const Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text('GCash', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                                              Text('Mobile Payment', style: TextStyle(fontSize: 12, color: _textSecondary)),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                  const Text('Payment Amount:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                  const SizedBox(height: 12),
                                  TextField(
                                    controller: amountCtrl,
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    decoration: InputDecoration(
                                      hintText: 'Enter amount (₱)',
                                      prefixText: '₱ ',
                                      prefixStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                      filled: true,
                                      fillColor: _bgWhite,
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                  const Text('Parking Rates:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: _bgLight,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: _borderLight),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: const [
                                        Text('₱50 - Car & Motorcycle', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                        Text('(First 3 hours)', style: TextStyle(fontSize: 11, color: _textSecondary)),
                                        SizedBox(height: 8),
                                        Text('₱10 - Succeeding per hour', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                        Text('(Or fraction thereof)', style: TextStyle(fontSize: 11, color: _textSecondary)),
                                        SizedBox(height: 8),
                                        Text('₱500 - Overnight Charge', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                        Text('(Plus regular parking fee)', style: TextStyle(fontSize: 11, color: _textSecondary)),
                                        SizedBox(height: 8),
                                        Text('₱500 - Lost/Damaged Ticket', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                        Text('(Plus regular parking fee)', style: TextStyle(fontSize: 11, color: _textSecondary)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx),
                                child: const Text('Cancel', style: TextStyle(color: _textPrimary)),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  final amount = amountCtrl.text.isNotEmpty ? amountCtrl.text : '0';
                                  final reservedDateTime = DateTime(
                                    _date.year,
                                    _date.month,
                                    _date.day,
                                    _time.hour,
                                    _time.minute,
                                  );
                                  // Save receipt for each selected slot
                                  for (final slot in _selectedSlots) {
                                    final receipt = {
                                      'slot': slot,
                                      'area': widget.area,
                                      'date': reservedDateTime,
                                      'amount': double.tryParse(amount) ?? 0.0,
                                      'reservedAt': DateTime.now(),
                                    };
                                    widget.onReserveSuccess?.call(receipt);
                                  }
                                  setState(() {
                                    _reservedSlots.addAll(_selectedSlots);
                                    _selectedSlots.clear();
                                  });
                                  // Show immediate confirmation
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('${_reservedSlots.length} slot(s) reserved successfully! Amount: ₱$amount'),
                                      behavior: SnackBarBehavior.floating,
                                      backgroundColor: _accentEmerald,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                },
                                child: const Text('Pay with GCash', style: TextStyle(color: _accentBlue, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ),
                        );
                      },
                      child: Text('Reserve ${_selectedSlots.length} Slot(s)', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    ),
                  ),
                ] else if (_reservedSlots.isNotEmpty) ...[
                  // Show All Reservations and Early Leave options
                  ..._reservedSlots.map((slot) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 50,
                            child: FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: _accentRose,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () {
                                showDialog(
                                  context: context,
                                  builder: (ctx) => AlertDialog(
                                    title: const Text('Confirm Leave'),
                                    content: Text('End reservation for Slot $slot?'),
                                    actions: [
                                      TextButton(
                                        onPressed: () => Navigator.pop(ctx),
                                        child: const Text('No', style: TextStyle(color: _textPrimary)),
                                      ),
                                      TextButton(
                                        onPressed: () {
                                          Navigator.pop(ctx);
                                          setState(() => _reservedSlots.remove(slot));
                                          widget.onEarlyLeave?.call(slot);
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Slot $slot checked out. Refund processed!'),
                                              behavior: SnackBarBehavior.floating,
                                              backgroundColor: _accentEmerald,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                              duration: const Duration(seconds: 2),
                                            ),
                                          );
                                        },
                                        child: const Text('Yes, Leave', style: TextStyle(color: _accentRose, fontWeight: FontWeight.w700)),
                                      ),
                                    ],
                                  ),
                                );
                              },
                              child: const Text('Early leave', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 50,
                            child: FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: _accentEmerald,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: () {},
                              child: Text(
                                'Reserved: $slot',
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  )).toList(),
                ],
                const SizedBox(height: 32), // Extra space at bottom
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Receipt row widget
class _ReceiptRow extends StatelessWidget {
  const _ReceiptRow(this.label, this.value);
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 14, color: _textSecondary, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(fontSize: 14, color: _textPrimary, fontWeight: FontWeight.w700)),
      ],
    );
  }
}

class ParkAndGoShell extends StatefulWidget {
  const ParkAndGoShell({super.key});

  @override
  State<ParkAndGoShell> createState() => _ParkAndGoShellState();
}

class _ParkAndGoShellState extends State<ParkAndGoShell> {
  static const List<String> _parkingSlots = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
    'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
  ];

  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  String _profileName = 'Juan Dela Cruz';
  String _profileEmail = 'juan.dela.cruz@email.com';
  String _selectedSlot = 'A1';
  DateTime _scheduleDate = DateTime(2026, 1, 22);
  TimeOfDay _scheduleTime = const TimeOfDay(hour: 15, minute: 0);

  bool _loggedIn = false;
  bool _rememberMe = false;
  bool _isSignUp = false;
  int _tabIndex = 0;
  bool _isDarkMode = false;

  double _walletBalance = 500.0;
  final List<Map<String, dynamic>> _transactions = [];
  final List<Map<String, dynamic>> _reservations = [];
  final List<Map<String, dynamic>> _receiptHistory = [];
  final List<Map<String, dynamic>> _notifications = [];

  // Parking locations
  final List<Map<String, String>> _parkingLocations = [
    {'name': 'Crossroad Tandang Sora', 'address': 'Tandang Sora, Manila', 'id': 'crossroad', 'image': 'assets/crossroad.jpg'},
    {'name': 'SM North EDSA', 'address': 'Quezon City', 'id': 'smnorth', 'image': 'assets/sm.jpg'},
    {'name': 'Robinson Galleria', 'address': 'Ermita, Manila', 'id': 'robinson', 'image': 'assets/robinson.jpg'},
    {'name': 'Trinoma Mall', 'address': 'Quezon City', 'id': 'trinoma', 'image': 'assets/ayala_mall.jpg'},
  ];
  late String _selectedLocation = _parkingLocations[0]['id']!;

  // Splash screen state
  bool _showSplash = true;

  @override
  void initState() {
    super.initState();
    Timer(const Duration(seconds: 2), () {
      if (mounted) setState(() => _showSplash = false);
    });
  }

  void _showMsg(String m) => ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        content: Text(m),
        behavior: SnackBarBehavior.floating,
        backgroundColor: _textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );

  void _submitAuth() {
    if (_emailCtrl.text.trim().isEmpty || _passCtrl.text.trim().isEmpty) {
      _showMsg('Please fill in all fields');
      return;
    }
    if (_isSignUp) {
      if (_nameCtrl.text.trim().isEmpty) {
        _showMsg('Please enter your full name');
        return;
      }
      if (_passCtrl.text != _confirmPassCtrl.text) {
        _showMsg('Passwords do not match');
        return;
      }
      _profileName = _nameCtrl.text.trim();
      _profileEmail = _emailCtrl.text.trim();
    }
    setState(() {
      _loggedIn = true;
      _tabIndex = 0;
    });
  }

  void _logout() => setState(() {
        _loggedIn = false;
        _tabIndex = 0;
        _isSignUp = false;
        _reservations.clear();
        _emailCtrl.clear();
        _passCtrl.clear();
        _nameCtrl.clear();
        _confirmPassCtrl.clear();
      });

  void _addReceiptToHistory(Map<String, dynamic> receipt) {
    setState(() {
      _receiptHistory.add(receipt);
      final amount = receipt['amount'] as double? ?? 50.0;
      _walletBalance -= amount;
      _transactions.add({
        'title': 'Parking Spot ${receipt['slot']}',
        'date': DateTime.now(),
        'amount': -amount,
        'type': 'debit'
      });
      _notifications.insert(0, {
        'title': 'Reservation Confirmed',
        'subtitle': 'Your parking spot ${receipt['slot']} in ${receipt['area']} is reserved',
        'icon': Icons.check_circle_rounded,
        'color': _accentEmerald,
        'time': DateTime.now(),
      });
    });
    _showMsg('Spot ${receipt['slot']} reserved for P${(receipt['amount'] ?? 50.0).toStringAsFixed(0)}');
  }

  void _handleEarlyLeave(String slot) {
    setState(() {
      // Find and remove the reservation with this slot
      final index = _receiptHistory.indexWhere((r) => r['slot'] == slot);
      if (index != -1) {
        final refundAmount = _receiptHistory[index]['amount'] as double? ?? 50.0;
        _walletBalance += refundAmount;
        _transactions.add({
          'title': 'Parking Refund - Early Leave',
          'date': DateTime.now(),
          'amount': refundAmount,
          'type': 'credit'
        });
        _receiptHistory.removeAt(index);
      }
    });
  }

  Future<void> _pickDate() async {
    final p = await showDatePicker(
        context: context,
        initialDate: _scheduleDate,
        firstDate: DateTime(2025),
        lastDate: DateTime(2030));
    if (p != null) setState(() => _scheduleDate = p);
  }

  Future<void> _pickTime() async {
    final p = await showTimePicker(context: context, initialTime: _scheduleTime);
    if (p != null) setState(() => _scheduleTime = p);
  }

  bool _isAvailable(String s, DateTime d, TimeOfDay t) {
    final target = DateTime(d.year, d.month, d.day, t.hour, t.minute);
    return !_reservations.any((r) {
      final rd = r['date'] as DateTime;
      final rt = r['time'] as TimeOfDay;
      return r['slot'] == s &&
          DateTime(rd.year, rd.month, rd.day, rt.hour, rt.minute) == target;
    });
  }

  int _occupiedCount(DateTime d, TimeOfDay t) =>
      _parkingSlots.where((s) => !_isAvailable(s, d, t)).length;
  int _availableCount(DateTime d, TimeOfDay t) =>
      _parkingSlots.length - _occupiedCount(d, t);

  void _cancelRes(int i) {
    setState(() => _reservations.removeAt(i));
    _showMsg('Reservation cancelled.');
  }

  String _fmt(DateTime d, TimeOfDay t) =>
      '${MaterialLocalizations.of(context).formatMediumDate(d)} at ${t.format(context)}';

  void _openPaymentSheet() {
    const parkingFee = 50.0;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _bgWhite,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (c) => StatefulBuilder(
        builder: (context, setSheetState) => Padding(
          padding: EdgeInsets.only(
              left: 24, right: 24, top: 16,
              bottom: MediaQuery.of(c).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: Container(width: 40, height: 4,
                  decoration: BoxDecoration(color: _textMuted.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(2)))),
              const SizedBox(height: 24),
              const Text('Payment', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: _textPrimary)),
              const SizedBox(height: 4),
              Text('Reserve Spot $_selectedSlot', style: const TextStyle(fontSize: 14, color: _textSecondary)),
              const SizedBox(height: 24),
              _GC(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('ORDER SUMMARY', style: TextStyle(fontSize: 10, color: _accentBlue, fontWeight: FontWeight.w800, letterSpacing: 1)),
                const SizedBox(height: 14),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Parking Fee', style: TextStyle(color: _textSecondary, fontSize: 14)),
                  Text('P${parkingFee.toStringAsFixed(0)}', style: const TextStyle(color: _textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                ]),
                const SizedBox(height: 8),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Service Fee', style: TextStyle(color: _textSecondary, fontSize: 14)),
                  const Text('P0', style: TextStyle(color: _textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                ]),
                const Divider(height: 20, color: _borderLight),
                Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                  const Text('Total', style: TextStyle(color: _textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                  Text('P${parkingFee.toStringAsFixed(0)}', style: const TextStyle(color: _accentBlue, fontSize: 18, fontWeight: FontWeight.w800)),
                ]),
              ])),
              const SizedBox(height: 20),
              const Text('PAYMENT METHOD', style: TextStyle(fontSize: 10, color: _accentBlue, fontWeight: FontWeight.w800, letterSpacing: 1)),
              const SizedBox(height: 12),
              _PayOption(icon: Icons.account_balance_wallet_rounded, title: 'Statio Nexus Wallet',
                  subtitle: 'Balance: P${_walletBalance.toStringAsFixed(0)}', selected: true, onTap: () {}),
              const SizedBox(height: 10),
              _PayOption(icon: Icons.credit_card_rounded, title: 'Credit / Debit Card',
                  subtitle: 'Visa •••• 4242', selected: false, onTap: () => _showMsg('Card payment coming soon!')),
              const SizedBox(height: 10),
              _PayOption(icon: Icons.payments_rounded, title: 'GCash',
                  subtitle: '0917 000 0000', selected: false, onTap: () => _showMsg('GCash payment coming soon!')),
              const SizedBox(height: 24),
              SizedBox(width: double.infinity, height: 56,
                child: FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: _accentBlue, foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () {
                    if (_walletBalance < parkingFee) { _showMsg('Insufficient wallet balance!'); return; }
                    Navigator.pop(c);
                    setState(() {
                      _walletBalance -= parkingFee;
                      _reservations.add({'slot': _selectedSlot, 'date': _scheduleDate, 'time': _scheduleTime, 'reservedAt': DateTime.now(), 'amount': parkingFee});
                      _transactions.add({'title': 'Parking Spot $_selectedSlot', 'date': DateTime.now(), 'amount': -parkingFee, 'type': 'debit'});
                    });
                    _showMsg('Spot $_selectedSlot reserved! P${parkingFee.toStringAsFixed(0)} deducted from wallet.');
                  },
                  child: const Text('Pay & Reserve', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _openTopUpSheet() {
    final amountCtrl = TextEditingController();
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: _bgWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (c) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 16,
            bottom: MediaQuery.of(c).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 40, height: 4,
              decoration: BoxDecoration(color: _textMuted.withOpacity(0.5), borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 24),
          const Text('Top Up Wallet', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: _textPrimary)),
          const SizedBox(height: 24),
          _Inp(ctrl: amountCtrl, hint: 'Amount (P)', icon: Icons.payments_rounded),
          const SizedBox(height: 20),
          Wrap(spacing: 10, runSpacing: 10,
            children: [100, 200, 500, 1000].map((amt) => ActionChip(
              label: Text('P$amt'), onPressed: () => amountCtrl.text = amt.toString(),
              backgroundColor: _bgInput, labelStyle: const TextStyle(color: _textPrimary, fontWeight: FontWeight.w600),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              side: const BorderSide(color: _borderLight),
            )).toList(),
          ),
          const SizedBox(height: 24),
          SizedBox(width: double.infinity, height: 56,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _accentBlue, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () {
                final amt = double.tryParse(amountCtrl.text) ?? 0;
                if (amt <= 0) { _showMsg('Enter a valid amount'); return; }
                Navigator.pop(c);
                setState(() {
                  _walletBalance += amt;
                  _transactions.add({'title': 'Wallet Top Up', 'date': DateTime.now(), 'amount': amt, 'type': 'credit'});
                });
                _showMsg('P${amt.toStringAsFixed(0)} added to wallet!');
              },
              child: const Text('Top Up Now', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            ),
          ),
        ]),
      ),
    );
  }

  void _openEditProfile() {
    final n = TextEditingController(text: _profileName);
    final e = TextEditingController(text: _profileEmail);
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: _bgWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (c) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24,
            bottom: MediaQuery.of(c).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 40, height: 4,
              decoration: BoxDecoration(color: _textMuted.withOpacity(0.5), borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 24),
          const Text('Edit Profile', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: _textPrimary)),
          const SizedBox(height: 24),
          Center(child: _PAvatar(initials: 'PG', size: 90)),
          const SizedBox(height: 24),
          _Inp(ctrl: n, hint: 'Full Name', icon: Icons.person_rounded),
          const SizedBox(height: 14),
          _Inp(ctrl: e, hint: 'Email', icon: Icons.email_rounded),
          const SizedBox(height: 28),
          SizedBox(width: double.infinity, height: 56,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _accentBlue, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () {
                setState(() {
                  _profileName = n.text.trim().isEmpty ? _profileName : n.text.trim();
                  _profileEmail = e.text.trim().isEmpty ? _profileEmail : e.text.trim();
                });
                Navigator.pop(c);
                _showMsg('Profile updated!');
              },
              child: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            ),
          ),
        ]),
      ),
    );
  }

  void _openVehicle() {
    final mk = TextEditingController();
    final md = TextEditingController();
    final pl = TextEditingController();
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: _bgWhite,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
      builder: (c) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24,
            bottom: MediaQuery.of(c).viewInsets.bottom + 24),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          Center(child: Container(width: 40, height: 4,
              decoration: BoxDecoration(color: _textMuted.withOpacity(0.5), borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 24),
          const Text('My Vehicle', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: _textPrimary)),
          const SizedBox(height: 24),
          Center(child: Container(width: 72, height: 72,
              decoration: BoxDecoration(color: _accentBlue.withOpacity(0.12), borderRadius: BorderRadius.circular(20)),
              child: const Icon(Icons.directions_car_rounded, color: _accentBlue, size: 36))),
          const SizedBox(height: 24),
          _Inp(ctrl: mk, hint: 'Vehicle Make', icon: Icons.directions_car_filled_rounded),
          const SizedBox(height: 14),
          _Inp(ctrl: md, hint: 'Vehicle Model', icon: Icons.time_to_leave_rounded),
          const SizedBox(height: 14),
          _Inp(ctrl: pl, hint: 'Plate Number', icon: Icons.badge_rounded),
          const SizedBox(height: 28),
          SizedBox(width: double.infinity, height: 56,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _accentBlue, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () {
                if (mk.text.trim().isEmpty || md.text.trim().isEmpty || pl.text.trim().isEmpty) {
                  _showMsg('Fill all required fields!'); return;
                }
                Navigator.pop(c);
                _showMsg('Vehicle saved!');
              },
              child: const Text('Save Vehicle', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            ),
          ),
        ]),
      ),
    );
  }



  void _openSupport() => showModalBottomSheet(
    context: context, backgroundColor: _bgWhite,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))),
    builder: (c) => Padding(padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Center(child: Container(width: 40, height: 4,
            decoration: BoxDecoration(color: _textMuted.withOpacity(0.5), borderRadius: BorderRadius.circular(2)))),
        const SizedBox(height: 24),
        const Text('Customer Service', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: _textPrimary)),
        const SizedBox(height: 16),
        _MT(icon: Icons.chat_rounded, title: 'Live Chat', subtitle: 'Chat with support',
            onTap: () { Navigator.pop(c); Navigator.push(context, MaterialPageRoute(builder: (_) => _chatSupport())); }),
        const SizedBox(height: 12),
        _MT(icon: Icons.phone_rounded, title: 'Call Support', subtitle: '0917 000 0000',
            onTap: () { Navigator.pop(c); Navigator.push(context, MaterialPageRoute(builder: (_) => _callSupport())); }),
        const SizedBox(height: 12),
        _MT(icon: Icons.email_rounded, title: 'Email Support', subtitle: 'support@parkandgo.com',
            onTap: () { Navigator.pop(c); Navigator.push(context, MaterialPageRoute(builder: (_) => _emailSupport())); }),
      ]),
    ),
  );

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return Scaffold(
        backgroundColor: _bgLight,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/logo.png',
                width: 180,
                height: 180,
                errorBuilder: (_, __, ___) => Container(
                  width: 180,
                  height: 180,
                  decoration: BoxDecoration(
                    color: _accentBlue.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.local_parking, size: 80, color: _accentBlue),
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'STATION NEXUS',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: _accentBlue,
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Smart Parking Made Easy',
                style: TextStyle(
                  fontSize: 14,
                  color: _textSecondary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (!_loggedIn)
      return Scaffold(
        backgroundColor: _bgLight,
        body: SafeArea(
            child: Center(
                child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: SingleChildScrollView(
              padding: const EdgeInsets.all(28), child: _auth()),
        ))),
      );

    final screens = [_home(), _wallet(), _notif(), _profile(), _reserve()];

    return Scaffold(
      backgroundColor: _bgLight,
      body: SafeArea(child: IndexedStack(index: _tabIndex, children: screens)),
      bottomNavigationBar: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: _FNav(
              selectedIndex: _tabIndex < 4 ? _tabIndex : -1,
              onSelected: (i) => setState(() => _tabIndex = i),
              onReserve: () => setState(() => _tabIndex = 4),
              showReserveButton: _tabIndex != 4,
            ),
          )),
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  AUTH SCREEN — Without close button
  // ═══════════════════════════════════════════════════════════════

  Widget _auth() => Container(
        decoration: BoxDecoration(
            color: _bgWhite,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 20,
                  offset: const Offset(0, 4))
            ]),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                  padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
                  child: Text(
                    _isSignUp ? 'User Registration' : 'User Login',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: _accentBlue),
                  )),
              const Divider(height: 1, color: _borderLight),
              Padding(
                  padding: const EdgeInsets.fromLTRB(28, 24, 28, 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (_isSignUp) ...[
                        _AuthInput(
                          ctrl: _nameCtrl,
                          hint: 'Full Name',
                          icon: Icons.person_outline_rounded,
                        ),
                        const SizedBox(height: 14),
                      ],
                      _AuthInput(
                        ctrl: _emailCtrl,
                        hint: 'E-mail address/Phone No.',
                        icon: Icons.person_outline_rounded,
                      ),
                      const SizedBox(height: 14),
                      _AuthInput(
                        ctrl: _passCtrl,
                        hint: 'Password',
                        icon: Icons.lock_outline_rounded,
                        obscure: true,
                      ),
                      const SizedBox(height: 14),
                      if (_isSignUp) ...[
                        _AuthInput(
                          ctrl: _confirmPassCtrl,
                          hint: 'Confirm Password',
                          icon: Icons.lock_outline_rounded,
                          obscure: true,
                        ),
                        const SizedBox(height: 14),
                      ],
                      if (!_isSignUp)
                        Row(children: [
                          SizedBox(
                              width: 20,
                              height: 20,
                              child: Checkbox(
                                value: _rememberMe,
                                onChanged: (v) =>
                                    setState(() => _rememberMe = v ?? false),
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(4)),
                                side: const BorderSide(color: _borderInput),
                                checkColor: _bgWhite,
                                activeColor: _accentBlue,
                                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              )),
                          const SizedBox(width: 8),
                          const Text('Remember me',
                              style: TextStyle(
                                  fontSize: 13, 
                                  color: _textSecondary,
                                  fontWeight: FontWeight.w500)),
                          const Spacer(),
                          TextButton(
                              onPressed: () => _showMsg('Forgot password flow...'),
                              style: TextButton.styleFrom(
                                  foregroundColor: _textSecondary,
                                  padding: EdgeInsets.zero,
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                              child: const Text('Forgot password?',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w500,
                                      fontSize: 13))),
                        ]),
                      const SizedBox(height: 20),
                      SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: FilledButton(
                            style: FilledButton.styleFrom(
                                backgroundColor: _accentBlue,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10)),
                                elevation: 0),
                            onPressed: _submitAuth,
                            child: Text(
                              _isSignUp ? 'SIGN UP' : 'LOGIN',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700, 
                                  fontSize: 16,
                                  letterSpacing: 0.5),
                            ),
                          )),
                      const SizedBox(height: 18),
                      Center(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            _isSignUp = !_isSignUp;
                            _emailCtrl.clear();
                            _passCtrl.clear();
                            _nameCtrl.clear();
                            _confirmPassCtrl.clear();
                          }),
                          child: RichText(
                            text: TextSpan(
                              style: const TextStyle(
                                  fontSize: 13, 
                                  color: _textMuted,
                                  fontWeight: FontWeight.w500),
                              children: [
                                TextSpan(
                                    text: _isSignUp
                                        ? "Already have an account? "
                                        : "Don't have an account yet? "),
                                TextSpan(
                                    text: _isSignUp ? 'Sign in now' : 'Sign up now',
                                    style: const TextStyle(
                                        color: _accentBlue,
                                        fontWeight: FontWeight.w700)),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  )),
            ]),
      );

  // ═══════════════════════════════════════════════════════════════
  //  SCREENS
  // ═══════════════════════════════════════════════════════════════

  Widget _home() {
    final occ = _occupiedCount(_scheduleDate, _scheduleTime);
    final avail = _availableCount(_scheduleDate, _scheduleTime);
    final label = _fmt(_scheduleDate, _scheduleTime);
    final sa = {
      for (final s in _parkingSlots)
        s: _isAvailable(s, _scheduleDate, _scheduleTime)
    };
    return Column(children: [
      _AH(
          title: 'Home',
          trail: IconButton(
              onPressed: _openSupport,
              icon:
                  const Icon(Icons.support_agent_rounded, color: _accentBlue, size: 28))),
      Expanded(
          child: ListView(padding: const EdgeInsets.all(20), children: [
        const SizedBox(height: 4),
        _SL('Current Status'),
        Row(children: [
          Expanded(
              child: _SSC(
                  value: '$avail',
                  label: 'Available',
                  icon: Icons.event_available_rounded,
                  color: _accentEmerald)),
          const SizedBox(width: 12),
          Expanded(
              child: _SSC(
                  value: '$occ',
                  label: 'Occupied',
                  icon: Icons.local_parking_rounded,
                  color: _accentRose)),
        ]),
        const SizedBox(height: 20),
        // Add Choose Parking Location here on Home (same UI as Reserve)
        _SL('Choose Parking Location'),
        ..._parkingLocations.map((loc) {
          final isSelected = loc['id'] == _selectedLocation;
          final isOpen = loc['id'] == 'crossroad';
          return GestureDetector(
            onTap: () {
              if (isOpen) {
                setState(() {
                  _selectedLocation = loc['id']!;
                  _tabIndex = 4; // navigate to Reserve screen
                });
              } else {
                _showMsg('Coming soon');
              }
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              height: 140,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected ? _accentBlue : _borderLight,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: _accentBlue.withOpacity(0.15),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : null,
                image: DecorationImage(
                  image: AssetImage(loc['image'] ?? 'assets/logo.png'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(children: [
                Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding:
                          const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isOpen ? _accentEmerald : Colors.white.withOpacity(0.92),
                        borderRadius: BorderRadius.circular(12),
                        border: isOpen ? null : Border.all(color: _borderLight),
                      ),
                      child: Text(isOpen ? 'OPEN' : 'COMING SOON',
                          style: TextStyle(
                              color: isOpen ? Colors.white : _textMuted,
                              fontSize: 12,
                              fontWeight: FontWeight.w700)),
                    )),
                Positioned(
                    left: 16,
                    bottom: 16,
                    right: 16,
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(loc['name'] ?? '',
                              style: const TextStyle(
                                  color: _bgWhite,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text(loc['address'] ?? '',
                              style: const TextStyle(
                                  color: _bgWhite,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600)),
                        ]))
              ]),
            ),
          );
        }),

        const SizedBox(height: 8),
      ])),
    ]);
  }

  Widget _reserve() {
    return Column(children: [
      _AH(
          title: 'Reserve',
          trail: IconButton(
              onPressed: () => setState(() => _tabIndex = 2),
              icon: const Icon(Icons.notifications_rounded,
                  color: _accentBlue, size: 28))),
      Expanded(
          child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              children: [
            _SL('Choose Parking Location'),
            ..._parkingLocations.map((loc) {
              final isSelected = loc['id'] == _selectedLocation;
              return GestureDetector(
                onTap: () => setState(() => _selectedLocation = loc['id']!),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  height: 140,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? _accentBlue : _borderLight,
                      width: isSelected ? 2 : 1,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: _accentBlue.withOpacity(0.15),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            )
                          ]
                        : null,
                    image: DecorationImage(
                      image: AssetImage(loc['image'] ?? 'assets/logo.png'),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.black.withOpacity(0.4),
                              Colors.black.withOpacity(0.6),
                            ],
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(loc['name']!,
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        fontSize: 16)),
                                const SizedBox(height: 4),
                                Text(loc['address']!,
                                    style: const TextStyle(
                                        fontSize: 12, color: Colors.white70)),
                                if (loc['id'] != 'crossroad')
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Text('Coming soon',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: Color(0xFF94A3B8),
                                            fontStyle: FontStyle.italic)),
                                  ),
                              ],
                            ),
                            if (loc['id'] == 'crossroad')
                              GestureDetector(
                                onTap: () {
                                  if (loc['id'] == 'crossroad') {
                                    Navigator.of(context).push(MaterialPageRoute(
                                        builder: (_) => SelectArea(
                                          reservedSlots: _receiptHistory
                                              .map((r) => (r['slot'] ?? '').toString())
                                              .where((slot) => slot.isNotEmpty)
                                              .toList(),
                                          onReserveSuccess: _addReceiptToHistory,
                                          allReservations: _receiptHistory,
                                          onEarlyLeave: _handleEarlyLeave,
                                        )));
                                  } else {
                                    _showMsg('Coming soon');
                                  }
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _accentBlue,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text('Select & Reserve',
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600)),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ])),
    ]);
  }

  Widget _chatSupport() {
    final messageCtrl = TextEditingController();
    final messages = <Map<String, dynamic>>[
      {'text': 'Hi! How can we help you today?', 'isSent': false, 'time': '10:30 AM'},
    ];
    return Scaffold(
      backgroundColor: _bgWhite,
      appBar: AppBar(
        backgroundColor: _bgWhite,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded, color: _textPrimary),
            onPressed: () => Navigator.pop(context)),
        title: const Text('Chat Support', style: TextStyle(color: _textPrimary, fontWeight: FontWeight.w700, fontSize: 18)),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
              itemCount: messages.length,
              itemBuilder: (c, i) {
                final msg = messages[i];
                return Align(
                  alignment: msg['isSent'] ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: msg['isSent'] ? _accentBlue : _bgLight,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: msg['isSent'] ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                      children: [
                        Text(msg['text'], style: TextStyle(
                          color: msg['isSent'] ? Colors.white : _textPrimary,
                          fontSize: 14,
                        )),
                        const SizedBox(height: 4),
                        Text(msg['time'], style: TextStyle(
                          color: msg['isSent'] ? Colors.white70 : _textMuted,
                          fontSize: 12,
                        )),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: BoxDecoration(
              border: Border(top: BorderSide(color: _textMuted.withOpacity(0.2))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: messageCtrl,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      hintStyle: TextStyle(color: _textMuted),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: _textMuted.withOpacity(0.3))),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: _textMuted.withOpacity(0.3))),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(24),
                          borderSide: const BorderSide(color: _accentBlue, width: 2)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: BoxDecoration(color: _accentBlue, shape: BoxShape.circle),
                  child: IconButton(
                    icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                    onPressed: () {
                      if (messageCtrl.text.isNotEmpty) {
                        _showMsg('Message sent!');
                        messageCtrl.clear();
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _callSupport() {
    return Scaffold(
      backgroundColor: _bgWhite,
      appBar: AppBar(
        backgroundColor: _bgWhite,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded, color: _textPrimary),
            onPressed: () => Navigator.pop(context)),
        title: const Text('Call Support', style: TextStyle(color: _textPrimary, fontWeight: FontWeight.w700, fontSize: 18)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: _accentBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(color: _accentBlue, shape: BoxShape.circle),
                  padding: const EdgeInsets.all(16),
                  child: const Icon(Icons.phone_rounded, color: Colors.white, size: 32),
                ),
                const SizedBox(height: 16),
                const Text('Call Our Support Team', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: _textPrimary)),
                const SizedBox(height: 8),
                const Text('We\'re available 24/7 to help you', style: TextStyle(fontSize: 14, color: _textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const Text('CONTACT INFORMATION', style: TextStyle(fontSize: 10, color: _accentBlue, fontWeight: FontWeight.w800, letterSpacing: 1)),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(border: Border.all(color: _borderLight), borderRadius: BorderRadius.circular(12)),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Icon(Icons.phone_rounded, color: _accentBlue, size: 24),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Hotline', style: TextStyle(fontSize: 12, color: _textMuted, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    const Text('0917 000 0000', style: TextStyle(fontSize: 16, color: _textPrimary, fontWeight: FontWeight.w700)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('COMMON ISSUES', style: TextStyle(fontSize: 10, color: _accentBlue, fontWeight: FontWeight.w800, letterSpacing: 1)),
          const SizedBox(height: 12),
          _FAQItem('Reservation Issues', 'Having trouble making a reservation'),
          const SizedBox(height: 12),
          _FAQItem('Payment Problems', 'Issues with payment processing'),
          const SizedBox(height: 12),
          _FAQItem('Cancellation Help', 'Need to cancel your reservation'),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _accentBlue,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () async {
                final Uri url = Uri(scheme: 'tel', path: '0917000000');
                if (await canLaunchUrl(url)) {
                  await launchUrl(url);
                } else {
                  _showMsg('Cannot make calls on this device');
                }
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.phone_rounded, color: Colors.white),
                  SizedBox(width: 8),
                  Text('Call Now', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Colors.white)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _FAQItem(String title, String subtitle) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: _borderLight), borderRadius: BorderRadius.circular(12)),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Icon(Icons.help_outline_rounded, color: _accentBlue, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, color: _textPrimary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(fontSize: 12, color: _textMuted)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: _textMuted),
        ],
      ),
    );
  }

  Widget _emailSupport() {
    final subjectCtrl = TextEditingController();
    final messageCtrl = TextEditingController();
    return Scaffold(
      backgroundColor: _bgWhite,
      appBar: AppBar(
        backgroundColor: _bgWhite,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded, color: _textPrimary),
            onPressed: () => Navigator.pop(context)),
        title: const Text('Email Support', style: TextStyle(color: _textPrimary, fontWeight: FontWeight.w700, fontSize: 18)),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const SizedBox(height: 20),
          Container(
            decoration: BoxDecoration(
              color: _accentBlue.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(color: _accentBlue, shape: BoxShape.circle),
                  padding: const EdgeInsets.all(16),
                  child: const Icon(Icons.email_rounded, color: Colors.white, size: 32),
                ),
                const SizedBox(height: 16),
                const Text('Send us an Email', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: _textPrimary)),
                const SizedBox(height: 8),
                const Text('We\'ll respond within 24 hours', style: TextStyle(fontSize: 14, color: _textSecondary)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('SEND MESSAGE', style: TextStyle(fontSize: 10, color: _accentBlue, fontWeight: FontWeight.w800, letterSpacing: 1)),
          const SizedBox(height: 12),
          const Text('Email', style: TextStyle(fontSize: 12, color: _textPrimary, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(border: Border.all(color: _borderLight), borderRadius: BorderRadius.circular(8)),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: const Text('support@parkandgo.com', style: TextStyle(fontSize: 14, color: _textSecondary)),
          ),
          const SizedBox(height: 16),
          const Text('Subject', style: TextStyle(fontSize: 12, color: _textPrimary, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextField(
            controller: subjectCtrl,
            decoration: InputDecoration(
              hintText: 'What is your inquiry about?',
              hintStyle: TextStyle(color: _textMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: _borderLight)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: _borderLight)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _accentBlue, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
          const SizedBox(height: 16),
          const Text('Message', style: TextStyle(fontSize: 12, color: _textPrimary, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          TextField(
            controller: messageCtrl,
            maxLines: 6,
            decoration: InputDecoration(
              hintText: 'Describe your issue...',
              hintStyle: TextStyle(color: _textMuted),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: _borderLight)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide(color: _borderLight)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _accentBlue, width: 2)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: FilledButton(
              style: FilledButton.styleFrom(backgroundColor: _accentBlue,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              onPressed: () async {
                if (subjectCtrl.text.isEmpty || messageCtrl.text.isEmpty) {
                  _showMsg('Please fill in all fields');
                  return;
                }
                final Uri url = Uri(
                  scheme: 'mailto',
                  path: 'support@parkandgo.com',
                  queryParameters: {
                    'subject': subjectCtrl.text,
                    'body': messageCtrl.text,
                  },
                );
                if (await canLaunchUrl(url)) {
                  await launchUrl(url);
                  _showMsg('Email app opened successfully');
                  subjectCtrl.clear();
                  messageCtrl.clear();
                } else {
                  _showMsg('Cannot open email app on this device');
                }
              },
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.send_rounded, color: Colors.white),
                  SizedBox(width: 8),
                  Text('Send Email', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Colors.white)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _wallet() {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        const _AH(title: 'Receipt History'),
        const SizedBox(height: 12),
        _SL('Reserved Parking Spots'),
        if (_receiptHistory.isEmpty)
          const _ES(
              icon: Icons.receipt_long_rounded,
              title: 'No receipts yet',
              subtitle: 'Your reserved parking will appear here.')
        else
          ..._receiptHistory.reversed.toList().asMap().entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _GC(
                    child: Row(children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: _accentBlue.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(
                      Icons.local_parking_rounded,
                      color: _accentBlue,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Slot ${e.value['slot']} - ${e.value['area']}',
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: _textPrimary,
                                  fontSize: 15)),
                          const SizedBox(height: 2),
                          Text(
                            MaterialLocalizations.of(context).formatShortDate(
                                (e.value['date'] ?? e.value['reservedAt']) as DateTime),
                            style: const TextStyle(
                                fontSize: 13, color: _textMuted),
                          ),
                        ]),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'P${(e.value['amount'] as double? ?? 50.0).toStringAsFixed(0)}',
                        style: const TextStyle(
                          color: _accentBlue,
                          fontWeight: FontWeight.w700,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _accentEmerald.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'Reserved',
                          style: TextStyle(
                            color: _accentEmerald,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ])),
              )),
        const SizedBox(height: 24),
        _SL('Recent Transactions'),
        if (_transactions.isEmpty)
          const _ES(
              icon: Icons.receipt_long_rounded,
              title: 'No transactions yet',
              subtitle: 'Your payment history will appear here.')
        else
          ..._transactions.reversed.toList().asMap().entries.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _GC(
                    child: Row(children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: (e.value['type'] == 'credit'
                              ? _accentEmerald
                              : _accentRose)
                          .withOpacity(0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      e.value['type'] == 'credit'
                          ? Icons.add_rounded
                          : Icons.remove_rounded,
                      color: e.value['type'] == 'credit'
                          ? _accentEmerald
                          : _accentRose,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(e.value['title'],
                              style: const TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: _textPrimary,
                                  fontSize: 15)),
                          const SizedBox(height: 2),
                          Text(
                            MaterialLocalizations.of(context)
                                .formatShortDate(e.value['date'] as DateTime),
                            style: const TextStyle(
                                fontSize: 13, color: _textMuted),
                          ),
                        ]),
                  ),
                  Text(
                    '${e.value['type'] == 'credit' ? '+' : '-'}P${(e.value['amount'] as double).abs().toStringAsFixed(0)}',
                    style: TextStyle(
                      color: e.value['type'] == 'credit'
                          ? _accentEmerald
                          : _accentRose,
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ])),
              )),
      ],
    );
  }

  Widget _notif() => Column(children: [
        const _AH(title: 'Notifications'),
        Expanded(
            child: ListView(padding: const EdgeInsets.all(20), children: [
          _SL('Recent Alerts'),
          _NT(
              icon: Icons.local_parking_rounded,
              title: 'Parking slots available',
              subtitle:
                  '${_availableCount(_scheduleDate, _scheduleTime)} slot(s) available.',
              color: _accentEmerald),
          const SizedBox(height: 12),
          _NT(
              icon: Icons.event_available_rounded,
              title: 'Reservation reminder',
              subtitle: _receiptHistory.isEmpty
                  ? 'No active reservations.'
                  : '${_receiptHistory.length} active reservation(s).',
              color: _accentBlue),
          if (_notifications.isNotEmpty) ...[
            const SizedBox(height: 24),
            _SL('Your Receipt Notifications'),
            ..._notifications.map((notif) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _GC(
                      child: Row(children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: (notif['color'] as Color).withOpacity(0.12),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        notif['icon'] as IconData,
                        color: notif['color'] as Color,
                        size: 26,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                        child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                          Text(notif['title'] as String,
                              style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: _textPrimary,
                                  fontSize: 16)),
                          const SizedBox(height: 4),
                          Text(notif['subtitle'] as String,
                              style: const TextStyle(
                                  fontSize: 14, color: _textSecondary)),
                        ])),
                  ])),
                )),
          ],
          const SizedBox(height: 24),
          _SL('Your Reservations'),
          if (_receiptHistory.isEmpty)
            const _ES(
                icon: Icons.notifications_none_rounded,
                title: 'No reservation alerts',
                subtitle: 'Reserved parking updates will show here.')
          else
            ..._receiptHistory.asMap().entries.map((e) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _HT(
                      title: 'Parking Slot ${e.value['slot']}',
                      subtitle: MaterialLocalizations.of(context).formatShortDate(
                          (e.value['date'] ?? e.value['reservedAt']) as DateTime),
                      amount: 'P${(e.value['amount'] as double? ?? 50.0).toStringAsFixed(0)}',
                      amountColor: _accentBlue,
                      badge: const _SB(
                          text: 'Reserved',
                          bg: Color(0x1A10B981),
                          fg: _accentEmerald),
                      icon: Icons.local_parking_rounded,
                      iconColor: _accentBlue,
                      onCancel: () {
                        setState(() {
                          _receiptHistory.removeAt(e.key);
                        });
                        _showMsg('Reservation removed');
                      }),
                )),
        ])),
      ]);

  Widget _profile() =>
      ListView(padding: const EdgeInsets.fromLTRB(20, 16, 20, 24), children: [
        const _AH(title: 'Profile'),
        const SizedBox(height: 12),
        _GC(
            child: Row(children: [
          const _PAvatar(initials: 'PG', size: 72),
          const SizedBox(width: 16),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(_profileName,
                    style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: _textPrimary)),
                const SizedBox(height: 4),
                Text(_profileEmail,
                    style: const TextStyle(fontSize: 14, color: _textMuted)),
              ])),
        ])),
        const SizedBox(height: 16),
        const SizedBox(height: 24),
        _SL('Account'),
        _MT(
            icon: Icons.person_rounded,
            title: 'Edit Profile',
            subtitle: 'Name, email, password',
            onTap: _openEditProfile),
        const SizedBox(height: 12),
        _MT(
            icon: Icons.directions_car_rounded,
            title: 'My Vehicle',
            subtitle: 'Plate number & vehicle type',
            onTap: _openVehicle),
        const SizedBox(height: 24),
        _SL('About & Settings'),
        _GC(
            child: Row(children: [
          Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                  color: _accentBlue.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12)),
              child: const Icon(Icons.info_rounded, color: _accentBlue, size: 26)),
          const SizedBox(width: 16),
          const Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text('App Version', style: TextStyle(fontWeight: FontWeight.w700, color: _textPrimary, fontSize: 15)),
                SizedBox(height: 3),
                Text('Version 1.0.0', style: TextStyle(fontSize: 13, color: _textSecondary)),
              ])),
        ])),
        const SizedBox(height: 12),
        _GC(
            onTap: () => setState(() => _isDarkMode = !_isDarkMode),
            child: Row(children: [
          Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                  color: _accentBlue.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12)),
              child: Icon(_isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: _accentBlue, size: 26)),
          const SizedBox(width: 16),
          Expanded(
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                Text(_isDarkMode ? 'Dark Mode' : 'Light Mode', style: const TextStyle(fontWeight: FontWeight.w700, color: _textPrimary, fontSize: 15)),
                const SizedBox(height: 3),
                Text(_isDarkMode ? 'Currently enabled' : 'Currently disabled', style: const TextStyle(fontSize: 13, color: _textSecondary)),
              ])),
          Switch(
            value: _isDarkMode,
            onChanged: (value) => setState(() => _isDarkMode = value),
            activeColor: _accentBlue,
          ),
        ])),
        const SizedBox(height: 24),
        _MT(
            icon: Icons.logout_rounded,
            title: 'Logout',
            subtitle: 'Sign out of account',
            iconColor: _accentRose,
            titleColor: _accentRose,
            onTap: _logout),
      ]);
}

// ═══════════════════════════════════════════════════════════════
//  AUTH INPUT
// ═══════════════════════════════════════════════════════════════

class _AuthInput extends StatelessWidget {
  const _AuthInput({
    required this.ctrl,
    required this.hint,
    required this.icon,
    this.obscure = false,
  });
  final TextEditingController ctrl;
  final String hint;
  final IconData icon;
  final bool obscure;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      style: const TextStyle(color: _textPrimary, fontSize: 16),
      decoration: InputDecoration(
        prefixIcon: Icon(icon, color: _textMuted, size: 24),
        hintText: hint,
        hintStyle: const TextStyle(color: _textMuted, fontSize: 15),
        filled: true,
        fillColor: _bgInput,
        border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _borderLight)),
        enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _borderLight)),
        focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _accentBlue, width: 1.5)),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  SHARED WIDGETS (with enlarged navbar & centering)
// ═══════════════════════════════════════════════════════════════

class _FNav extends StatelessWidget {
  _FNav(
      {required this.selectedIndex,
      required this.onSelected,
      required this.onReserve,
      required this.showReserveButton});
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final VoidCallback onReserve;
  final bool showReserveButton;

  final _items = [
    (icon: Icons.home_rounded, label: 'Home'),
    (icon: Icons.account_balance_wallet_rounded, label: 'Receipt History'),
    (icon: Icons.notifications_rounded, label: 'Alerts'),
    (icon: Icons.person_rounded, label: 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            top: 10,
            child: Container(
              decoration: BoxDecoration(
                color: _bgWhite,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: _borderLight),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 24,
                      offset: const Offset(0, 6))
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 14, 12, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NI(
                    icon: _items[0].icon,
                    label: _items[0].label,
                    sel: selectedIndex == 0,
                    tap: () => onSelected(0)),
                _NI(
                    icon: _items[1].icon,
                    label: _items[1].label,
                    sel: selectedIndex == 1,
                    tap: () => onSelected(1)),
                const SizedBox(width: 80),
                _NI(
                    icon: _items[2].icon,
                    label: _items[2].label,
                    sel: selectedIndex == 2,
                    tap: () => onSelected(2)),
                _NI(
                    icon: _items[3].icon,
                    label: _items[3].label,
                    sel: selectedIndex == 3,
                    tap: () => onSelected(3)),
              ],
            ),
          ),
          if (showReserveButton)
            Positioned(
              top: -28,
              child: GestureDetector(
                onTap: onReserve,
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                        colors: [Color(0xFF0284C7), _accentBlueLight],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                          color: _accentBlue.withOpacity(0.4),
                          blurRadius: 24,
                          offset: const Offset(0, 10))
                    ],
                  ),
                  child: const Center(
                      child: Text('R',
                          style: TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w700))),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _NI extends StatelessWidget {
  const _NI(
      {required this.icon,
      required this.label,
      required this.sel,
      required this.tap});
  final IconData icon;
  final String label;
  final bool sel;
  final VoidCallback tap;
  @override
  Widget build(BuildContext context) => GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: tap,
      child: Container(
          width: 64,
          height: 64,
          alignment: Alignment.center,
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
            Icon(icon, color: sel ? _accentBlue : _textMuted, size: 26),
            const SizedBox(height: 4),
            Text(label,
                textAlign: TextAlign.center,
                style: TextStyle(
                    color: sel ? _accentBlue : _textMuted,
                    fontSize: 11,
                    fontWeight: sel ? FontWeight.w600 : FontWeight.w400)),
          ])));
}

class _AH extends StatelessWidget {
  const _AH({required this.title, this.trail});
  final String title;
  final Widget? trail;
  @override
  Widget build(BuildContext context) {
    // Center title properly by using left spacer of same width as trail (if trail exists)
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      child: Row(
        children: [
          if (trail != null) const SizedBox(width: 48),
          Expanded(
            child: Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: _textPrimary),
            ),
          ),
          if (trail != null) SizedBox(width: 48, child: trail),
        ],
      ),
    );
  }
}

class _SL extends StatelessWidget {
  const _SL(this.label);
  final String label;
  @override
  Widget build(BuildContext context) => Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(label,
          style: const TextStyle(
              color: _textSecondary,
              fontSize: 14,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.4)));
}

class _SSC extends StatelessWidget {
  const _SSC(
      {required this.value,
      required this.label,
      required this.icon,
      required this.color});
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
          color: _bgWhite,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: _borderLight)),
      child: Row(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 26)),
        const SizedBox(width: 14),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(value,
              style: TextStyle(
                  color: color,
                  fontSize: 30,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5)),
          const SizedBox(height: 2),
          Text(label,
              style: const TextStyle(color: _textSecondary, fontSize: 13)),
        ]),
      ]));
}

class _PLM extends StatelessWidget {
  const _PLM({required this.label, required this.slots, required this.sa, this.showCenter = true});
  final String label;
  final List<String> slots;
  final Map<String, bool> sa;
  final bool showCenter;

  @override
  Widget build(BuildContext context) {
    final tl = slots.take(4).toList();
    final tr = slots.skip(4).take(4).toList();
    final bl = slots.skip(8).take(4).toList();
    final br = slots.skip(12).take(4).toList();
    return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
            color: _bgWhite,
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: _borderLight)),
        child:
            Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Row(children: [
            Expanded(
                child: Text(label,
                    style: const TextStyle(
                        color: _textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 15))),
            _ML(label: 'A', text: 'Available', color: _accentEmerald),
            const SizedBox(width: 12),
            _ML(label: 'O', text: 'Occupied', color: _accentRose),
          ]),
            const SizedBox(height: 8),
          const SizedBox(height: 16),
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: _PSR(slots: tl, sa: sa)),
            showCenter ? _EL() : const SizedBox(width: 82),
            Expanded(child: _PSR(slots: tr, sa: sa)),
          ]),
          const SizedBox(height: 20),
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Expanded(child: _PSR(slots: bl, sa: sa)),
            const SizedBox(width: 82),
            Expanded(child: _PSR(slots: br, sa: sa)),
          ]),
            const SizedBox(height: 14),
        ]));
  }
}

class _PSR extends StatelessWidget {
  const _PSR({required this.slots, required this.sa});
  final List<String> slots;
  final Map<String, bool> sa;
  @override
  Widget build(BuildContext context) => Row(
      children: slots
          .map((s) => Expanded(child: _PST(slot: s, available: sa[s] ?? true)))
          .toList());
}

class _PST extends StatelessWidget {
  const _PST({required this.slot, required this.available});
  final String slot;
  final bool available;
  @override
  Widget build(BuildContext context) {
    final c = available ? _accentEmerald : _accentRose;
    final bg = available
        ? _accentEmerald.withOpacity(0.08)
        : _accentRose.withOpacity(0.08);
    return Container(
        height: 80,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: c.withOpacity(0.35), width: 1.2)),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                  color: c.withOpacity(0.18), shape: BoxShape.circle),
              alignment: Alignment.center,
              child: Text(available ? 'A' : 'O',
                  style: TextStyle(
                      color: c, fontSize: 14, fontWeight: FontWeight.w900))),
          const SizedBox(height: 4),
          Text(slot,
              style: TextStyle(
                  color: c.withOpacity(0.85),
                  fontSize: 11,
                  fontWeight: FontWeight.w700)),
        ]));
  }
}

class _EL extends StatelessWidget {
  const _EL();
  @override
  Widget build(BuildContext context) => Container(
      width: 82,
      height: 106,
      margin: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
          color: _bgInput.withOpacity(0.4),
          borderRadius: BorderRadius.circular(8),
          border: Border(
              left: BorderSide(color: _accentBlue.withOpacity(0.2), width: 2),
              right:
                  BorderSide(color: _accentBlue.withOpacity(0.2), width: 2))),
      alignment: Alignment.center,
      child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.keyboard_arrow_down_rounded,
            color: _accentBlue.withOpacity(0.5), size: 28),
        const SizedBox(height: 4),
        Container(
            width: 4,
            height: 28,
            decoration: BoxDecoration(
                color: _accentBlue.withOpacity(0.25),
                borderRadius: BorderRadius.circular(2))),
      ]));
}

class _ML extends StatelessWidget {
  const _ML({required this.label, required this.text, required this.color});
  final String label;
  final String text;
  final Color color;
  @override
  Widget build(BuildContext context) =>
      Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: color.withOpacity(0.45))),
            alignment: Alignment.center,
            child: Text(label,
                style: TextStyle(
                    color: color, fontSize: 12, fontWeight: FontWeight.w900))),
        const SizedBox(width: 5),
        Text(text,
            style: const TextStyle(
                color: _textSecondary,
                fontSize: 12,
                fontWeight: FontWeight.w600)),
      ]);
}

class _GC extends StatelessWidget {
  const _GC({required this.child, this.onTap});
  final Widget child;
  final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final b = Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
            color: _bgWhite,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: _borderLight)),
        child: child);
    if (onTap == null) return b;
    return InkWell(
        borderRadius: BorderRadius.circular(24), onTap: onTap, child: b);
  }
}

class _Inp extends StatelessWidget {
  const _Inp(
      {required this.ctrl,
      required this.hint,
      required this.icon,
      this.obscure = false});
  final TextEditingController ctrl;
  final String hint;
  final IconData icon;
  final bool obscure;
  @override
  Widget build(BuildContext context) => TextField(
        controller: ctrl,
        obscureText: obscure,
        style: const TextStyle(color: _textPrimary, fontSize: 16),
        decoration: InputDecoration(
          prefixIcon: Icon(icon, color: _accentBlue, size: 22),
          hintText: hint,
          hintStyle: const TextStyle(color: _textMuted, fontSize: 15),
          filled: true,
          fillColor: _bgInput,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(18),
              borderSide: const BorderSide(color: _borderLight)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(18),
              borderSide: const BorderSide(color: _borderLight)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(18),
              borderSide: const BorderSide(color: _accentBlue, width: 1.5)),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        ),
      );
}

class _NT extends StatelessWidget {
  const _NT(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.color});
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  @override
  Widget build(BuildContext context) => _GC(
          child: Row(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 26)),
        const SizedBox(width: 16),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: _textPrimary,
                  fontSize: 16)),
          const SizedBox(height: 4),
          Text(subtitle,
              style: const TextStyle(fontSize: 14, color: _textSecondary)),
        ])),
      ]));
}

class _ES extends StatelessWidget {
  const _ES({required this.icon, required this.title, required this.subtitle});
  final IconData icon;
  final String title;
  final String subtitle;
  @override
  Widget build(BuildContext context) => Center(
      child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 48),
          child: Column(children: [
            Icon(icon, size: 72, color: _textMuted),
            const SizedBox(height: 16),
            Text(title,
                style: const TextStyle(
                    color: _textSecondary,
                    fontSize: 18,
                    fontWeight: FontWeight.w500)),
            const SizedBox(height: 8),
            Text(subtitle,
                style: const TextStyle(color: _textMuted, fontSize: 14)),
          ])));
}

class _HT extends StatelessWidget {
  const _HT(
      {required this.title,
      required this.subtitle,
      required this.amount,
      required this.amountColor,
      required this.badge,
      required this.icon,
      required this.iconColor,
      this.onCancel});
  final String title;
  final String subtitle;
  final String amount;
  final Color amountColor;
  final Widget badge;
  final IconData icon;
  final Color iconColor;
  final VoidCallback? onCancel;
  @override
  Widget build(BuildContext context) => _GC(
          child: Row(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: iconColor.withOpacity(0.12),
                borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: iconColor, size: 26)),
        const SizedBox(width: 16),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  color: _textPrimary,
                  fontSize: 16)),
          const SizedBox(height: 4),
          Text(subtitle,
              style: const TextStyle(fontSize: 14, color: _textSecondary)),
        ])),
        Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
          Text(amount,
              style:
                  TextStyle(color: amountColor, fontWeight: FontWeight.w700, fontSize: 16)),
          const SizedBox(height: 6),
          Row(children: [
            badge,
            if (onCancel != null) ...[
              const SizedBox(width: 8),
              GestureDetector(
                  onTap: onCancel,
                  child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                          color: _accentRose.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.close,
                          size: 16, color: _accentRose)))
            ],
          ]),
        ]),
      ]));
}

class _SB extends StatelessWidget {
  const _SB({required this.text, required this.bg, required this.fg});
  final String text;
  final Color bg;
  final Color fg;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(text,
          style:
              TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w700)));
}

class _PAvatar extends StatelessWidget {
  const _PAvatar({required this.initials, this.size = 64});
  final String initials;
  final double size;
  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
                colors: [Color(0xFF0369A1), _accentBlue],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight),
            boxShadow: [
              BoxShadow(
                  color: _accentBlue.withOpacity(0.25),
                  blurRadius: 14,
                  offset: const Offset(0, 5))
            ]),
        alignment: Alignment.center,
        child: Text(initials,
            style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: size * 0.32)),
      );
}

class _SC extends StatelessWidget {
  const _SC({required this.value, required this.label});
  final String value;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
      padding: const EdgeInsets.symmetric(vertical: 18),
      decoration: BoxDecoration(
          color: _bgWhite,
          border: Border.all(color: _borderLight),
          borderRadius: BorderRadius.circular(20)),
      child: Column(children: [
        Text(value,
            style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: _accentBlue,
                letterSpacing: -0.3)),
        const SizedBox(height: 4),
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                color: _textSecondary,
                fontWeight: FontWeight.w500)),
      ]));
}

class _MT extends StatelessWidget {
  const _MT(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.onTap,
      this.iconColor,
      this.titleColor});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color? iconColor;
  final Color? titleColor;
  @override
  Widget build(BuildContext context) => _GC(
      onTap: onTap,
      child: Row(children: [
        Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
                color: (iconColor ?? _accentBlue).withOpacity(0.1),
                borderRadius: BorderRadius.circular(14)),
            child: Icon(icon, color: iconColor ?? _accentBlue, size: 26)),
        const SizedBox(width: 16),
        Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title,
              style: TextStyle(
                  fontWeight: FontWeight.w700,
                  color: titleColor ?? _textPrimary,
                  fontSize: 16)),
          const SizedBox(height: 3),
          Text(subtitle,
              style: const TextStyle(fontSize: 14, color: _textSecondary)),
        ])),
        const Icon(Icons.chevron_right_rounded, size: 24, color: _textMuted),
      ]));
}

class _PayOption extends StatelessWidget {
  const _PayOption(
      {required this.icon,
      required this.title,
      required this.subtitle,
      required this.selected,
      required this.onTap});
  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? _accentBlue.withOpacity(0.1) : _bgInput,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
              color: selected ? _accentBlue : _borderLight, width: 1.5),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: selected ? _accentBlue.withOpacity(0.2) : _bgWhite,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon,
                  color: selected ? _accentBlue : _textMuted, size: 26),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          color: selected ? _accentBlue : _textPrimary,
                          fontSize: 16)),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style:
                          const TextStyle(fontSize: 14, color: _textSecondary)),
                ],
              ),
            ),
            if (selected)
              Container(
                width: 26,
                height: 26,
                decoration: const BoxDecoration(
                    color: _accentBlue, shape: BoxShape.circle),
                child: const Icon(Icons.check_rounded,
                    color: Colors.white, size: 18),
              )
            else
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                    color: _bgWhite,
                    shape: BoxShape.circle,
                    border: Border.all(color: _borderLight)),
              ),
          ],
        ),
      ),
    );
  }
}