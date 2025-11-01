USE railway;

-- ============================================
--  TABLAS
-- ============================================

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni BIGINT NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  direccion VARCHAR(255),
  telefono VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS pacientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dni BIGINT NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  direccion VARCHAR(255),
  telefono VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS profesionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad_id INT NOT NULL,
  matricula VARCHAR(50) UNIQUE,
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

CREATE TABLE IF NOT EXISTS turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  profesional_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('pendiente','confirmado','cancelado','reprogramado','atendido') DEFAULT 'pendiente',
  UNIQUE KEY uq_turno (profesional_id, fecha, hora),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (profesional_id) REFERENCES profesionales(id)
);

-- ============================================
--  PROCEDIMIENTO almacenado
-- ============================================

DELIMITER //
CREATE PROCEDURE sp_asignar_turno(
  IN p_paciente_id INT,
  IN p_profesional_id INT,
  IN p_fecha DATE,
  IN p_hora TIME
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF EXISTS (
    SELECT 1 FROM turnos
     WHERE profesional_id = p_profesional_id
       AND fecha = p_fecha
       AND hora  = p_hora
       AND estado IN ('pendiente','confirmado','reprogramado')
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Horario ocupado';
  END IF;

  INSERT INTO turnos (paciente_id, profesional_id, fecha, hora, estado)
  VALUES (p_paciente_id, p_profesional_id, p_fecha, p_hora, 'pendiente');

  COMMIT;
END //
DELIMITER ;

-- ============================================
--  DATOS DE PRUEBA
-- ============================================

INSERT IGNORE INTO especialidades (id, nombre, descripcion)
VALUES (1,'Clínica Médica','Atención general');

INSERT IGNORE INTO profesionales (id, nombre, apellido, especialidad_id, matricula)
VALUES (1,'Laura','López',1,'M-1234');

INSERT IGNORE INTO pacientes (id, dni, nombre, apellido, direccion, telefono)
VALUES (1, 30111222, 'Juan', 'Pérez', 'Av. Siempre Viva 742', '380-555-000');

SHOW TABLES;
SHOW PROCEDURE STATUS WHERE Db = 'railway';

CALL sp_asignar_turno(1, 1, '2025-11-05', '10:30:00');
SELECT * FROM turnos;
