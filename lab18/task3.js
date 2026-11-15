const os = require('os');

function maskMac(mac) {
  if (!mac || mac === '00:00:00:00:00:00') {
    return '00:00:00:**:**:**';
  }
  const parts = mac.split(':');
  if (parts.length === 6) {
    return `${parts[0]}:${parts[1]}:${parts[2]}:**:**:**`;
  }
  return mac;
}

function showNetworkAndUserInfo() {
  const interfaces = os.networkInterfaces();
  const interfaceNames = Object.keys(interfaces);

  console.log('=== Setevye interfejsy ===');
  let primaryInterface = null;

  interfaceNames.forEach((name) => {
    const list = interfaces[name] || [];
    list.forEach((item) => {
      console.log(`Interfeys:     ${name}`);
      console.log(`  Protokol:    ${item.family}`);
      console.log(`  IP-adres:    ${item.address}`);
      console.log(`  MAC:         ${maskMac(item.mac)}`);
      console.log(`  Vnutrenniy:  ${item.internal ? 'da' : 'net'}`);
      console.log('');

      if (!primaryInterface && !item.internal && (item.family === 'IPv4' || item.family === 4)) {
        primaryInterface = {
          name,
          address: item.address,
          mac: maskMac(item.mac)
        };
      }
    });
  });

  console.log(`Vsego interfejsov: ${interfaceNames.length}`);
  if (primaryInterface) {
    console.log(`Osnovnoy interfeys: ${primaryInterface.name} (${primaryInterface.address})`);
  } else {
    console.log('Osnovnoy interfeys: Ne nayden');
  }

  const user = os.userInfo();
  console.log('');
  console.log('=== Informaciya o polzovatele ===');
  console.log(`Imya polzovatelya:   ${user.username}`);
  console.log(`UID:                 ${user.uid !== undefined && user.uid !== -1 ? user.uid : 'N/A (Windows)'}`);
  console.log(`GID:                 ${user.gid !== undefined && user.gid !== -1 ? user.gid : 'N/A (Windows)'}`);
  console.log(`Domashnyaya papka:   ${user.homedir}`);
  console.log(`Obolochka:           ${user.shell || 'N/A (default shell)'}`);

  console.log('');
  console.log('Gruppa: 477');
  const isRoot = user.username === 'root' || user.uid === 0;
  console.log(`Proverka root:       ${isRoot ? 'da (VNIMANIE: root)' : 'net'}`);
}

if (require.main === module) {
  showNetworkAndUserInfo();
}

module.exports = {
  maskMac,
  showNetworkAndUserInfo
};
