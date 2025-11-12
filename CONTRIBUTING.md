# Contributing to Freeflow

Thank you for your interest in contributing to Freeflow! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your browser and operating system

### Suggesting Features

We're always looking for ways to improve Freeflow. To suggest a feature:
- Create an issue with a clear description of the feature
- Explain why this feature would be useful
- Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository** and create a new branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project's coding standards:
   - Use TypeScript for all code
   - Follow the existing code style
   - Write meaningful commit messages
   - Add comments for complex logic

3. **Test your changes** thoroughly:
   ```bash
   npm run dev
   npm run build
   npm run type-check
   ```

4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```

5. **Push to your fork** and submit a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use meaningful variable and function names
- Keep functions small and focused
- Add TypeScript types for all parameters and return values
- Use React hooks appropriately
- Follow the existing project structure
- Keep components modular and reusable

### Project Structure

```
Freeflow/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── styles/         # CSS files
├── public/             # Static assets
└── ...config files
```

### Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Freeflow.git
   cd Freeflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

### Commit Message Format

Use conventional commit messages:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for updates to existing features
- `Refactor:` for code refactoring
- `Docs:` for documentation changes
- `Style:` for formatting changes
- `Test:` for adding tests

Example: `Add: Implement undo/redo functionality`

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the `question` label
- Reach out to the maintainers

## License

By contributing to Freeflow, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Freeflow! 🎨
