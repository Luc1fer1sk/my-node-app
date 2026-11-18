class Student {
  constructor(data) {
    this.name = data.name;
    this.group_name = data.group_name || 'BBMO-01-23';
    this.course = Number(data.course) || 2;
    this.grade = Number(data.grade) || 4.0;
    this.created_at = data.created_at || new Date();
  }
}

module.exports = { Student };
