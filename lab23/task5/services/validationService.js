function validateStudent(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, message: 'Dannyye dolzhny byt obektom' };
  }
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return { valid: false, message: 'Polye name obyazatelno i dolzhno byt strokoy' };
  }
  if (data.grade !== undefined && (typeof data.grade !== 'number' || data.grade < 1 || data.grade > 5)) {
    return { valid: false, message: 'Polye grade dolzhno byt chislom ot 1 do 5' };
  }
  return { valid: true };
}

module.exports = { validateStudent };
