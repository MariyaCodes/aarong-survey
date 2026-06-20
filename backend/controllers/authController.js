import bcrypt from 'bcryptjs';
import Employee from '../models/Employee.js';
import Host from '../models/Host.js';
import { generateToken } from '../middleware/auth.js';

export const employeeLogin = async (req, res) => {
  const { employeeId, pin } = req.body;

  if (!employeeId || !pin) {
    return res.status(400).json({ message: 'Employee ID and PIN are required' });
  }

  const employee = await Employee.findByEmployeeId(employeeId.trim().toUpperCase());

  if (!employee || !employee.isActive) {
    return res.status(401).json({ message: 'Invalid Employee ID or PIN' });
  }

  const valid = await bcrypt.compare(pin, employee.pin);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid Employee ID or PIN' });
  }

  const token = generateToken({
    role: 'employee',
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.name,
  });

  res.json({
    token,
    employee: {
      employeeId: employee.employeeId,
      name: employee.name,
      department: employee.department,
    },
  });
};

export const hostLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const host = await Host.findByUsername(username.trim().toLowerCase());
  if (!host) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, host.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken({
    role: 'host',
    id: host.id,
    username: host.username,
    name: host.name,
  });

  res.json({
    token,
    host: { username: host.username, name: host.name },
  });
};
