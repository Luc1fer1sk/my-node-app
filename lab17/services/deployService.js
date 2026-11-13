function deployProject(env) {
  const targetEnv = env || 'development';
  return {
    env: targetEnv,
    url: `https://my-app-${targetEnv}.example.com`,
    status: 'razvernyto'
  };
}

module.exports = {
  deployProject
};
