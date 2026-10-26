import net from 'node:net';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const port = Number(process.env.PORT || 5055);

const probe = net.createServer();

probe.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n[dev] Port ${port} is already in use.`);
    console.error('[dev] Stop the other process:');
    console.error(`      lsof -nP -iTCP:${port} -sTCP:LISTEN`);
    console.error('[dev] Or start on another port (and update client API base):');
    console.error(`      PORT=${port + 1} npm run dev\n`);
    process.exit(1);
  }
  console.error('[dev] Port check failed:', error);
  process.exit(1);
});

probe.once('listening', () => {
  probe.close(() => process.exit(0));
});

probe.listen(port, '0.0.0.0');
