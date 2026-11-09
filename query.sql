
create table roles(
    role_id int auto_increment primary key,
    role_name varchar(255) not null unique
);


CREATE TABLE health_stations (
    station_id INT PRIMARY KEY AUTO_INCREMENT,
    station_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role_id INT,
    station_id INT,
    
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (station_id) REFERENCES health_stations(station_id)
);


CREATE TABLE medicine_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE suppliers (
    supplier_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NOT NULL
);


CREATE TABLE medicines (
    medicine_id INT PRIMARY KEY AUTO_INCREMENT,
    generic_name VARCHAR(100) NOT NULL,
    strength VARCHAR(50) NOT NULL,
    dosage_form VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reorder_level INT NOT NULL,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES medicine_categories(category_id)
);


CREATE TABLE medicine_batches (
    batch_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_no VARCHAR(50) NOT NULL,
    medicine_id INT NOT NULL,
    supplier_id INT,
    station_id INT NOT NULL,
    expiry_date DATE NOT NULL,
    qty_on_hand INT NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10, 2) NOT NULL,
    received_date DATE NOT NULL,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
    FOREIGN KEY (station_id) REFERENCES health_stations(station_id)
);


CREATE TABLE patients (
    patient_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    purok VARCHAR(50) NOT NULL,
    contact VARCHAR(20)
);

CREATE TABLE purchase_orders (
    po_id INT PRIMARY KEY AUTO_INCREMENT,
    po_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL
);

CREATE TABLE purchase_order_items (
    po_item_id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    medicine_id INT NOT NULL,
    qty_ordered INT NOT NULL,
    qty_received INT NOT NULL DEFAULT 0,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(po_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);


CREATE TABLE dispensing_records (
    dispense_id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    dispensed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (station_id) REFERENCES health_stations(station_id)
);


CREATE TABLE dispensing_items (
    dispense_item_id INT PRIMARY KEY AUTO_INCREMENT,
    dispense_id INT NOT NULL,
    batch_id INT NOT NULL,
    medicine_id INT NOT NULL,
    qty INT NOT NULL,
    FOREIGN KEY (dispense_id) REFERENCES dispensing_records(dispense_id),
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(batch_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);


CREATE TABLE adjustment_reasons (
    reason_id INT PRIMARY KEY AUTO_INCREMENT,
    reason_text VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE stock_movements (
    movement_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_id INT NOT NULL,
    user_id INT NOT NULL,
    reason_id INT NULL,
    movement_type VARCHAR(20) NOT NULL,
    qty INT NOT NULL,
    moved_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(batch_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reason_id) REFERENCES adjustment_reasons(reason_id)
);


CREATE TABLE alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type VARCHAR(50) NOT NULL,
    medicine_id INT NOT NULL,
    batch_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY (batch_id) REFERENCES medicine_batches(batch_id)
);
