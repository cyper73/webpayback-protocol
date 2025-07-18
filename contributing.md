# Contributing to WebPayback Protocol

Thank you for your interest in contributing to WebPayback Protocol! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Areas Where We Need Help

1. **Platform Integrations**
   - Adding support for new social media platforms
   - Improving existing platform verification methods
   - Testing verification flows across different platforms

2. **AI Model Detection**
   - Enhancing AI model identification accuracy
   - Adding support for new AI models and services
   - Improving detection algorithms and patterns

3. **Security & Testing**
   - Security auditing and vulnerability testing
   - Performance testing and optimization
   - Anti-fraud system improvements

4. **Documentation**
   - API documentation improvements
   - Tutorial creation and maintenance
   - Code documentation and examples

5. **Mobile Development**
   - React Native mobile applications
   - Mobile-specific UI/UX improvements
   - Mobile wallet integrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- PostgreSQL database
- Basic knowledge of TypeScript/React
- Understanding of blockchain concepts (helpful but not required)

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/webpayback.git
   cd webpayback
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other settings
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Project Structure

```
webpayback/
├── src/                     # Source code
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── lib/         # Utilities and configurations
│   │   │   └── hooks/       # Custom React hooks
│   ├── server/              # Node.js/Express backend
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   └── db.ts           # Database configuration
│   └── shared/              # Shared TypeScript schemas
├── docs/                   # Documentation files
├── contracts/              # Smart contracts
└── artifacts/              # Compiled contracts
```

## 📝 Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript for all new code
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled automatically
- **Naming**: Use descriptive names for variables and functions

### Git Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Your Changes**
   - Keep commits small and focused
   - Write clear commit messages
   - Test your changes thoroughly

3. **Commit Messages**
   ```
   feat: add support for Discord verification
   fix: resolve creator registration bug
   docs: update API documentation
   test: add tests for fraud detection
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create a Pull Request on GitHub
   ```

### Testing

- **Unit Tests**: Add tests for new functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows

```bash
npm test           # Run all tests
npm run test:unit  # Run unit tests only
npm run test:e2e   # Run end-to-end tests
```

### Database Changes

- **Schema Changes**: Use Drizzle migrations for database changes
- **Seeds**: Add seed data for testing new features
- **Documentation**: Update schema documentation

```bash
npm run db:push       # Push schema changes
npm run db:studio     # Open database studio
```

## 🎨 Frontend Development

### Component Guidelines

- **Radix UI**: Use Radix UI primitives for accessible components
- **Tailwind CSS**: Use Tailwind for styling
- **shadcn/ui**: Leverage existing shadcn components when possible
- **TypeScript**: All components must be fully typed

### State Management

- **TanStack Query**: Use for server state management
- **React Hook Form**: Use for form handling
- **Zod**: Use for validation schemas

Example component structure:
```typescript
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  // Component implementation
}
```

## 🔧 Backend Development

### API Guidelines

- **RESTful Design**: Follow REST principles
- **TypeScript**: All endpoints must be fully typed
- **Validation**: Use Zod schemas for request validation
- **Error Handling**: Implement proper error responses

Example API route:
```typescript
import { z } from 'zod';

const createCreatorSchema = z.object({
  websiteUrl: z.string().url(),
  walletAddress: z.string(),
});

app.post('/api/creators', async (req, res) => {
  try {
    const data = createCreatorSchema.parse(req.body);
    // Implementation
  } catch (error) {
    // Error handling
  }
});
```

### Database Guidelines

- **Drizzle ORM**: Use Drizzle for all database operations
- **Type Safety**: Maintain full type safety with database operations
- **Migrations**: Use proper migration files for schema changes

## 🧪 Testing Guidelines

### Test Structure

```typescript
describe('Component/Function Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should perform expected behavior', () => {
    // Test implementation
  });

  it('should handle error cases', () => {
    // Error case testing
  });
});
```

### Testing Best Practices

- **Isolation**: Each test should be independent
- **Descriptive Names**: Test names should clearly describe what they test
- **Edge Cases**: Test both happy path and error conditions
- **Mocking**: Mock external dependencies appropriately

## 🛡️ Security Considerations

### Security Best Practices

- **Input Validation**: Always validate and sanitize user input
- **Authentication**: Implement proper authentication checks
- **Authorization**: Ensure users can only access their own data
- **SQL Injection**: Use parameterized queries (Drizzle handles this)
- **XSS Protection**: Sanitize output and use React's built-in protections

### Sensitive Data

- **Environment Variables**: Never commit secrets to git
- **API Keys**: Use environment variables for all external service keys
- **Database URLs**: Keep database credentials secure
- **Private Keys**: Never expose blockchain private keys

## 📖 Documentation

### Code Documentation

- **JSDoc**: Document complex functions and classes
- **README Updates**: Update README files when adding new features
- **API Documentation**: Document all API endpoints
- **Type Definitions**: Provide clear type definitions

### Documentation Standards

```typescript
/**
 * Verifies creator ownership of a domain through meta tag verification
 * @param domain - The domain to verify
 * @param token - The verification token to check
 * @returns Promise resolving to verification result
 */
async function verifyDomainOwnership(domain: string, token: string): Promise<VerificationResult> {
  // Implementation
}
```

## 🎉 Pull Request Process

### Before Submitting

1. **Test Thoroughly**: Ensure all tests pass
2. **Update Documentation**: Update relevant documentation
3. **Check Formatting**: Run prettier and eslint
4. **Resolve Conflicts**: Rebase on latest main branch

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer review required
3. **Testing**: Reviewer will test the changes
4. **Approval**: Changes must be approved before merging

## 🤝 Community Guidelines

### Code of Conduct

- **Be Respectful**: Treat all contributors with respect
- **Be Collaborative**: Work together to solve problems
- **Be Patient**: Remember that everyone is learning
- **Be Constructive**: Provide helpful feedback and suggestions

### Communication

- **GitHub Issues**: Use for bug reports and feature requests
- **GitHub Discussions**: Use for questions and general discussion
- **Discord**: Join our community server for real-time chat
- **Email**: Contact maintainers for sensitive issues

## 🏆 Recognition

### Contributor Recognition

- **Contributors List**: All contributors are recognized in our README
- **Hall of Fame**: Outstanding contributors featured on our website
- **Rewards**: Active contributors may receive WPT token rewards
- **References**: We're happy to provide references for your contributions

### Types of Contributions

- **Code Contributions**: New features, bug fixes, improvements
- **Documentation**: Tutorials, guides, API documentation
- **Testing**: Bug reports, test cases, quality assurance
- **Design**: UI/UX improvements, graphics, branding
- **Community**: Helping other users, moderating discussions

## 📞 Getting Help

### Where to Ask Questions

1. **GitHub Discussions**: For general questions and discussion
2. **GitHub Issues**: For bug reports and feature requests
3. **Discord**: For real-time help and community chat
4. **Email**: For private inquiries to maintainers

### Common Issues

- **Setup Problems**: Check our setup documentation and known issues
- **Database Errors**: Ensure PostgreSQL is running and configured correctly
- **Build Errors**: Clear node_modules and reinstall dependencies
- **API Issues**: Check environment variables and network connectivity

Thank you for contributing to WebPayback Protocol! Your contributions help make the internet a fairer place for content creators.

---

**Questions?** Contact us at claudiob73@hotmail.com or join our Discord community.
