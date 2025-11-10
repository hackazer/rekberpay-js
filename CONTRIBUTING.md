# Contributing to RekberPay

Thank you for your interest in contributing to RekberPay! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and professional in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/rekberpay-js.git
cd rekberpay-js

# Add upstream remote
git remote add upstream https://github.com/hackazer/rekberpay-js.git
```

### 2. Create a Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments for complex logic
- Update tests if applicable

### 4. Commit and Push

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: Add feature description"

# Push to your fork
git push origin feature/your-feature-name
```

### 5. Create a Pull Request

- Go to GitHub and create a PR from your fork to the main repository
- Provide a clear description of changes
- Reference any related issues
- Wait for review and feedback

## Commit Message Guidelines

Follow conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions/changes
- `chore` - Build, dependencies, etc.

**Examples:**
```
feat(escrow): Add milestone-based release logic
fix(auth): Resolve session timeout issue
docs(readme): Update setup instructions
```

## Development Workflow

### Install Dependencies

```bash
pnpm install
```

### Run Development Server

```bash
pnpm run dev
```

### Type Checking

```bash
pnpm run type-check
```

### Format Code

```bash
pnpm run format
```

### Database Changes

If you modify the database schema:

```bash
# Generate migration
pnpm db:generate

# Apply migration
pnpm db:push

# Commit schema changes
git add drizzle/
git commit -m "db: Update schema for feature"
```

## Code Style

### TypeScript

- Use strict mode
- Define types explicitly
- Avoid `any` type
- Use interfaces for object shapes

```typescript
// Good
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): Promise<User> {
  // ...
}

// Avoid
function getUser(id: any): any {
  // ...
}
```

### React Components

- Use functional components
- Use hooks for state management
- Keep components focused and small
- Extract reusable logic into custom hooks

```typescript
// Good
interface UserCardProps {
  user: User;
  onSelect: (user: User) => void;
}

export function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <div onClick={() => onSelect(user)}>
      {user.name}
    </div>
  );
}

// Avoid
export function UserCard(props: any) {
  return <div onClick={() => props.onSelect(props.user)}>{props.user.name}</div>;
}
```

### Naming Conventions

- **Files:** kebab-case (e.g., `user-profile.tsx`)
- **Components:** PascalCase (e.g., `UserProfile`)
- **Functions:** camelCase (e.g., `getUserProfile`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Database fields:** camelCase (e.g., `createdAt`)

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Writing Tests

- Write tests for new features
- Aim for >80% code coverage
- Test edge cases and error scenarios
- Use descriptive test names

```typescript
describe('escrow.create', () => {
  it('should create an escrow with valid data', async () => {
    // Test implementation
  });

  it('should reject invalid amount', async () => {
    // Test implementation
  });
});
```

## Documentation

### Update README

If your changes affect setup or usage:

```bash
# Update README.md
# Commit changes
git add README.md
git commit -m "docs: Update README for new feature"
```

### Add Code Comments

```typescript
/**
 * Calculates the platform fee for an escrow transaction
 * @param amount - Transaction amount in cents
 * @param feePercentage - Fee percentage (e.g., 2.5 for 2.5%)
 * @returns Fee amount in cents
 */
function calculateFee(amount: number, feePercentage: number): number {
  return Math.round(amount * (feePercentage / 100));
}
```

## PR Review Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No unnecessary dependencies added

### During Review

- Respond to feedback promptly
- Make requested changes in new commits
- Ask questions if unclear
- Be open to suggestions

### After Approval

- Squash commits if requested
- Merge to main branch
- Delete feature branch

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable
- Environment details

### Feature Requests

Include:
- Clear description of feature
- Use case and motivation
- Proposed implementation (optional)
- Examples or mockups (if applicable)

## Areas for Contribution

### High Priority

- [ ] Payment gateway integration (Mayar)
- [ ] AI-powered URL parsing
- [ ] Email notification system
- [ ] Mobile responsiveness improvements
- [ ] Performance optimization

### Medium Priority

- [ ] SMS notifications
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] API documentation
- [ ] Test coverage expansion

### Low Priority

- [ ] UI/UX improvements
- [ ] Documentation enhancements
- [ ] Code refactoring
- [ ] Dependency updates

## Questions?

- Open an issue for questions
- Check existing issues first
- Join our community discussions
- Email: dev@rekberpay.com

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to RekberPay! 🎉
