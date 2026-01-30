# Contributing to Space Strategy Game

Thank you for your interest in contributing! Here are some guidelines to help you get started.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/space-strategy-game.git
   cd space-strategy-game
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Set Up Environment Variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Run Development Servers**
   ```bash
   npm run dev
   ```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use ESLint to check code style
- Write tests for new features

## Commit Guidelines

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or auxiliary tool changes

Example:
```
feat: add combat system for ship battles
fix: resolve planet colonization bug
docs: update API documentation
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes and commit them
3. Write or update tests as needed
4. Ensure all tests pass
5. Update documentation if needed
6. Submit a pull request

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Questions?

Feel free to open an issue for any questions or concerns.
