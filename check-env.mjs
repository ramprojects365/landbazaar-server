console.log('Checking DigitalOcean Spaces configuration...');
console.log('DO_SPACES_KEY:', process.env.DO_SPACES_KEY ? 'SET' : 'NOT SET');
console.log('DO_SPACES_SECRET:', process.env.DO_SPACES_SECRET ? 'SET' : 'NOT SET');
console.log('DO_SPACES_ENDPOINT:', process.env.DO_SPACES_ENDPOINT || 'NOT SET');
console.log('DO_SPACES_BUCKET:', process.env.DO_SPACES_BUCKET || 'NOT SET');
console.log('DO_SPACES_REGION:', process.env.DO_SPACES_REGION || 'NOT SET');
