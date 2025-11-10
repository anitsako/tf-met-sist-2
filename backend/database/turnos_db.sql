USE railway;

-- ======================
--  TABLAS
-- ======================

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
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS profesionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  especialidad_id INT NOT NULL,
  matricula VARCHAR(100),
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(255) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
);
-- borra la tabla turnos si existe para recrearla limpia (cuidado)
DROP TABLE IF EXISTS turnos;

CREATE TABLE turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT NOT NULL,
  profesional_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  estado ENUM('pendiente','confirmado','reprogramado','cancelado') DEFAULT 'pendiente',
  notas VARCHAR(255),
  CONSTRAINT fk_turno_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  CONSTRAINT fk_turno_prof FOREIGN KEY (profesional_id) REFERENCES profesionales(id),
  CONSTRAINT uq_turno_slot UNIQUE (profesional_id, fecha, hora)
);

-- ======================
--  PROCEDIMIENTO
-- ======================
DROP PROCEDURE IF EXISTS sp_asignar_turno;
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

-- ======================
--  DATOS DE PRUEBA
-- ======================
INSERT IGNORE INTO especialidades (id, nombre, descripcion)
VALUES (1,'Clínica Médica','Atención general');

INSERT IGNORE INTO profesionales (id, nombre, apellido, especialidad_id, matricula)
VALUES (1,'Laura','López',1,'M-1234');

INSERT IGNORE INTO pacientes (id, dni, nombre, apellido, direccion, telefono)
VALUES (1, 30111222, 'Juan', 'Pérez', 'Av. Siempre Viva 742', '380-555-000');

-- prueba
CALL sp_asignar_turno(1, 1, '2025-11-06', '10:30:00');
SELECT * FROM turnos;
