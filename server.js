const mysql = require("mysql2");
const inquirer = require("inquirer");
const express = require("express");

const connection = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "rootr00t!",
  database: "employee_track_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected as id " + connection.threadId + "\n");
  startUp();
});

function startUp() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "Add a department",
        "View all roles",
        "Add a role",
        "View all employees",
        "Add an employee",
        "Update an employee role",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "Add a department":
            addDepartment();
            break;
        case "View all roles":
          viewRoles();
          break;
        case "Add a role":
            addRole();
            break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "Update an employee role":
          updateEmployeeRole();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}

function viewDepartments() {
  connection.query("SELECT * FROM department", (err, res) => {
    if (err) throw err;
    console.table(res);
    startUp();
  });
}

function addDepartment() {
    inquirer
      .prompt({
        name: "department",
        type: "input",
        message: "Enter the name of the new department:",
      })
      .then((answer) => {
        connection.query(
          "INSERT INTO department SET ?",
          { name: answer.department },
          (err) => {
            if (err) throw err;
            console.log("✅Department added successfully!✅");
            startUp();
          }
        );
      });
  }

  function viewRoles() {
  const query =
    "SELECT role.id, role.title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id";
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startUp();
  });
}

function addRole() {
    connection.query("SELECT * FROM department", (err, res) => {
      if (err) throw err;
      const departmentNames = res.map((department) => department.name);
      inquirer
        .prompt([
          {
            name: "title",
            type: "input",
            message: "What is the title of the role?",
          },
          {
            name: "salary",
            type: "input",
            message: "What is the salary of the role?",
            validate: function (value) {
              if (isNaN(value) === false) {
                return true;
              }
              return false;
            },
          },
          {
            name: "department",
            type: "list",
            message: "Which department does the role belong to?",
            choices: departmentNames,
          },
        ])
        .then((answer) => {
          const department = res.find(
            (department) => department.name === answer.department
          );
          connection.query(
            "INSERT INTO role SET ?",
            {
              title: answer.title,
              salary: answer.salary,
              department_id: department.id,
            },
            (err, res) => {
              if (err) throw err;
              console.log(`✅\nAdded ${answer.title} to the database.\n✅`);
              startUp();
            }
          );
        });
    });
  }

  function viewEmployees() {
  const query =
    'SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON employee.manager_id = manager.id';
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    startUp();
  });
}

function addEmployee() {
  connection.query("SELECT * FROM role", (err, res) => {
    if (err) throw err;
    const roleChoices = res.map((role) => ({
      name: role.title,
      value: role.id,
    }));
    connection.query(
      "SELECT * FROM employee WHERE manager_id IS NULL",
      (err, res) => {
        if (err) throw err;
        const managerChoices = res.map((manager) => ({
          name: `${manager.first_name} ${manager.last_name}`,
          value: manager.id,
        }));
        inquirer
          .prompt([
            {
              name: "first_name",
              type: "input",
              message: "What is the employee's first name?",
            },
            {
              name: "last_name",
              type: "input",
              message: "What is the employee's last name?",
            },
            {
              name: "role_id",
              type: "list",
              message: "What is the employee's role?",
              choices: roleChoices,
            },
            {
              name: "manager_id",
              type: "list",
              message: "Who is the employee's manager?",
              choices: managerChoices,
            },
          ])
          .then((answer) => {
            connection.query(
              "INSERT INTO employee SET ?",
              {
                first_name: answer.first_name,
                last_name: answer.last_name,
                role_id: answer.role_id,
                manager_id: answer.manager_id,
              },
              (err) => {
                if (err) throw err;
                console.log(
                  `✅${answer.first_name} ${answer.last_name} added successfully!✅`
                );
                startUp();
              }
            );
          });
      }
    );
  });
}

function updateEmployeeRole() {
  connection.query(
    "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM employee",
    function (err, result) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: "employee",
            type: "list",
            message: "Which employee's role do you want to update?",
            choices: function () {
              return result.map((employee) => ({
                name: employee.name,
                value: employee.id,
              }));
            },
          },
        ])
        .then(function (answer) {
          const employeeId = answer.employee;

          connection.query(
            "SELECT id, title FROM role",
            function (err, result) {
              if (err) throw err;

              inquirer
                .prompt([
                  {
                    name: "role",
                    type: "list",
                    message: "What is the employee's new role?",
                    choices: function () {
                      return result.map((role) => ({
                        name: role.title,
                        value: role.id,
                      }));
                    },
                  },
                ])
                .then(function (answer) {
                  const roleId = answer.role;

                  connection.query(
                    "UPDATE employee SET role_id = ? WHERE id = ?",
                    [roleId, employeeId],
                    function (err, result) {
                      if (err) throw err;
                      console.log(`✅Employee's role has been updated!✅`);
                      startUp();
                    }
                  );
                });
            }
          );
        });
    }
  );
}