INSERT INTO roles(role_name)VALUES 
    ('admin'),
    ('pharmacist'),
    ('health worker');

INSERT INTO health_stations (station_name, address) 
VALUES 
    ('Central Health Center', 'valencia'),
    ('North Sub-Station', 'pinili'),
    ('East Barangay Station', 'cadawinonan');

INSERT INTO users (username, password_hash, full_name, role_id, station_id) 
VALUES 
    ('admin_jane', 'pass123', 'Jane Doe', 1, 1),
    ('pharma_john', 'pass123', 'John Smith', 2, 1),
    ('worker_sarah', 'pass123', 'Sarah Jenkins', 3, 2);

INSERT INTO medicine_categories (category_name) 
VALUES 
    ('Antibiotics'),
    ('Analgesics & Pain Relievers'),
    ('Vitamins & Supplements'),
    ('Antipyretics'),
    ('Antihistamines & Allergy'),
    ('Antacids & Gastrointestinal'),
    ('Antihypertensive (Blood Pressure)'),
    ('Antidiabetic'),
    ('Cough & Cold (Antitussives)'),
    ('Topical Ointments & Antiseptics');

INSERT INTO suppliers (supplier_name, contact) 
VALUES 
    ('MedPharma Global', '+63 2 8123 4567'),
    ('BioHealth Distributors', 'support@biohealth.com'),
    ('PharmaCare Phils Inc.', '+63 34 433 1234'),
    ('WellSpring Medical Supplies', 'contact@wellspringmed.ph'),
    ('Apex Pharma Solutions', '+63 2 8987 6543');

INSERT INTO medicines (generic_name, strength, dosage_form, unit, reorder_level, category_id)
VALUES
    ('Paracetamol', '500mg', 'Tablet', 'pcs', 100, 2),
    ('Amoxicillin', '250mg', 'Capsule', 'boxes', 50, 1),
    ('Salbutamol', '2mg', 'Tablet', 'pcs', 75, 9),
    ('ORS', '6.75g', 'Powder', 'sachets', 40, 6);

INSERT INTO medicine_batches (batch_no, medicine_id, supplier_id, station_id, expiry_date, qty_on_hand, unit_cost, received_date) 
VALUES 
    ('BATCH-PARA-001', 1, 1, 1, '2027-06-30', 500, 1.50, '2026-01-10'),
    ('BATCH-PARA-002', 1, 1, 1, '2026-12-15', 200, 1.50, '2025-06-10'),
    ('BATCH-AMOX-001', 2, 2, 1, '2027-10-01', 150, 3.25, '2026-02-01');

INSERT INTO patients (full_name, birthdate, purok, contact) 
VALUES 
    ('Maria Santos', '1988-04-12', 'Purok 1', '09171234567'),
    ('Juan Dela Cruz', '1975-09-25', 'Purok 3', '09189876543'),
    ('Ana Reyes', '2015-11-03', 'Purok 2', NULL);

INSERT INTO purchase_orders (po_date, total_amount) 
VALUES 
    ('2026-01-10', 1000.00),
    ('2026-06-15', 500.00),
    ('2026-12-01', 200.00),
    ('2027-03-15', 300.00);

INSERT INTO purchase_order_items (po_id, medicine_id, qty_ordered, qty_received) 
VALUES 
    (1, 1, 1000, 1000),
    (1, 2, 500, 500),
    (2, 3, 200, 0),
    (3, 4, 300, 150);

INSERT INTO adjustment_reasons (reason_text)
VALUES
    ('damaged'),
    ('lost'),
    ('expired'),
    ('miscount');

INSERT INTO dispensing_records (patient_id, user_id, station_id, dispensed_at)
VALUES
    (1, 2, 1, '2026-10-01 09:30:00'),
    (2, 2, 1, '2026-10-05 14:15:00');

INSERT INTO dispensing_items (dispense_id, batch_id, medicine_id, qty)
VALUES
    (1, 1, 1, 10),
    (1, 3, 2, 5),
    (2, 1, 1, 8);

INSERT INTO stock_movements (batch_id, user_id, reason_id, movement_type, qty, moved_at)
VALUES
    (1, 2, 1, 'adjustment', 5, '2026-10-01 10:00:00'),
    (3, 2, 4, 'count_check', -2, '2026-10-05 15:10:00');

INSERT INTO alerts (alert_type, medicine_id, batch_id, created_at, resolved_at)
VALUES
    ('low_stock', 1, 2, '2026-10-06 08:00:00', NULL),
    ('expired', 2, 3, '2026-10-07 09:00:00', '2026-10-07 12:00:00');

select * from roles;
select * from health_stations;
select * from medicine_categories;
select * from suppliers;
select * from medicines;
select * from medicine_batches;
select * from patients;
select * from purchase_orders;
select * from purchase_order_items;
select * from adjustment_reasons;
select * from dispensing_records;
select * from dispensing_items;
select * from stock_movements;
select * from alerts;
select * from roles;
select * from roles;
select * from roles;
