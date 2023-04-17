INSERT INTO department (name) VALUES
  ('Sales'),
  ('Engineering'),
  ('Finance'),
  ('Human Resources');

INSERT INTO role (title, salary, department_id) VALUES
  ('Sales Manager', 92000.00, 1),
  ('Sales Associate', 56000.00, 1),
  ('Lead Engineer', 140000.00, 2),
  ('Software Engineer', 85000.00, 2),
  ('Accountant', 95000.00, 3),
  ('HR Manager', 110000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
  ('Tyler', 'Wait', 1, NULL),
  ('Bruce', 'Wayne', 2, 1),
  ('Obi-Wan', 'Kenobi', 3, NULL),
  ('Peter', 'Parker', 4, 3),
  ('Jack', 'Sparrow', 5, NULL),
  ('Clark', 'Kent', 6, NULL);