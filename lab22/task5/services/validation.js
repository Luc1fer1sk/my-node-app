function validate(data) {
  const errors = [];
  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push('name: obyazatelnoe, ot 2 do 100 simvolov');
  }
  if (!data.group_name || !/^ББМО-\d{2}-\d{2}$/.test(data.group_name)) {
    errors.push('group_name: obyazatelnoe, format BBMO-XX-XX');
  }
  if (!Number.isInteger(Number(data.course)) || data.course < 1 || data.course > 4) {
    errors.push('course: tseloye, ot 1 do 4');
  }
  if (data.grade !== undefined && data.grade !== null) {
    if (data.grade < 0 || data.grade > 5) {
      errors.push('grade: ot 0 do 5');
    }
  }
  return errors;
}

module.exports = { validate };
