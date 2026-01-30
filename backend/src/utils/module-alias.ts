import moduleAlias from 'module-alias';
import path from 'path';

// Setup module aliases for production
moduleAlias.addAliases({
  '@': path.join(__dirname, '..'),
  '@/game': path.join(__dirname, '../game'),
  '@/players': path.join(__dirname, '../players'),
  '@/planets': path.join(__dirname, '../planets'),
  '@/ships': path.join(__dirname, '../ships'),
  '@/alliances': path.join(__dirname, '../alliances'),
  '@/messaging': path.join(__dirname, '../messaging'),
  '@/utils': path.join(__dirname, '../utils'),
  '@shared': path.join(__dirname, '../../shared')
});
