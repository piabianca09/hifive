# HiFive Co-working Management Platform - Development Guide

## Project Overview

HiFive is a comprehensive Next.js web application with Supabase integration for managing co-working spaces. It features role-based access control (Admin, Staff, Member), membership tracking, customer logging, product sales, and expense management.

## Architecture Overview

### Frontend Stack
- **Next.js 15** with App Router for file-based routing
- **React 19** for UI components
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Zod** for schema validation

### Backend & Database
- **Supabase** for PostgreSQL database and authentication
- **Next.js API Routes** for backend endpoints
- **Row-Level Security** for database-level access control

### Key Features Implemented
1. **Authentication System**: Email/password sign-up and sign-in
2. **Role-Based Access Control**: Admin, Staff, and Member roles
3. **Membership Management**: Multiple pass types with student/professional pricing
4. **Customer Logging**: Track check-ins for members and walk-ins
5. **Product & Sales Management**: Manage inventory and sales
6. **Expense Tracking**: Record and approve expenses
7. **Responsive Dashboards**: Role-specific dashboards for each user type

## File Structure

```
src/
├── app/                    # Next.js pages and API routes
├── components/             # Reusable React components
├── lib/                    # Core utilities and helpers
├── hooks/                  # Custom React hooks
└── store/                  # Zustand state stores
```

## Development Guidelines

### Code Organization
- Keep components small and focused (single responsibility)
- Use `'use client'` directive only when necessary
- Keep API routes lean with business logic in separate utilities
- Use TypeScript for type safety

### API Route Patterns
- Always check authentication first
- Verify user role/permissions before executing logic
- Return appropriate HTTP status codes
- Include error handling with meaningful messages

### Database Operations
- Use Supabase client from appropriate module (client.ts or server.ts)
- Apply Row-Level Security policies for sensitive data
- Index frequently queried columns
- Use foreign keys for data integrity

### State Management
- Use Zustand for global state (auth, user role)
- Prefer local state for component-specific data
- Keep store actions focused and atomic

## Key Technologies Used

### Libraries & Dependencies
- `@supabase/supabase-js`: Core Supabase client
- `zod`: Runtime schema validation
- `zustand`: Lightweight state management
- `axios`: HTTP client for API calls
- `qrcode.react`: QR code generation
- `next`: Framework foundation
- `react`: UI library
- `tailwindcss`: Utility-first CSS

## Authentication Flow

1. User signs up/in via auth forms
2. Supabase Auth creates user and JWT
3. User profile created with role assignment
4. Auth state stored in Zustand store
5. Protected routes check authentication
6. Navbar displays role-based navigation

## Database Schema

### Core Tables
- `user_profiles`: User information and roles
- `members`: Member-specific data with membership details
- `customer_logs`: Check-in records
- `products`: Product inventory
- `sales`: Transaction records
- `expenses`: Cost tracking
- `promos`: Discount and promotion codes

### Security
- Row-Level Security (RLS) enabled on all tables
- Policies restrict access by role and user ID
- Foreign keys maintain referential integrity
- Indexes optimize query performance

## Common Development Tasks

### Adding a New Feature
1. Define types in `src/lib/types/database.ts`
2. Create validation schema in `src/lib/schemas/`
3. Build API route in `src/app/api/`
4. Create React component in `src/components/`
5. Add page or route in `src/app/`
6. Update stores if needed in `src/store/`

### Adding Database Tables
1. Create table with SQL in Supabase Console
2. Add RLS policies for security
3. Create indexes for common queries
4. Update TypeScript types
5. Create Zod schemas for validation

### Protected API Routes Pattern
```typescript
// Check auth and role
const user = await supabase.auth.getUser();
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

const profile = await supabase.from('user_profiles').select('*').eq('id', user.id);
if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
```

## Configuration

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side operations

### Tailwind CSS
- Configured in `tailwind.config.ts`
- Uses Tailwind's default color palette
- Custom utilities can be added as needed

## Performance Considerations

- Next.js automatically code-splits routes
- Use `dynamic` imports for large components
- Images should be optimized with `next/image`
- Database queries should use indexes
- Consider pagination for large datasets
- Cache frequently accessed data in Zustand

## Security Best Practices

1. **Never expose secrets**: Keep keys in environment variables
2. **Validate inputs**: Use Zod on both client and server
3. **Check permissions**: Verify role before operations
4. **Use RLS policies**: Let database enforce access control
5. **Hash sensitive data**: Supabase handles password hashing
6. **CORS handling**: Configure appropriately for production

## Testing Strategy

### Recommended Approach
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows
- Manual testing in different roles

### Testing Tools
- Jest: Unit and integration testing
- Playwright: E2E testing
- Supabase emulator: Local database testing

## Deployment Checklist

- [ ] Verify all environment variables set
- [ ] Database tables created and RLS policies applied
- [ ] All API endpoints tested
- [ ] Authentication flow verified
- [ ] Dashboard pages functional
- [ ] No console errors
- [ ] Responsive design tested
- [ ] Performance optimized

## Common Issues & Solutions

### Database Connection Issues
- Verify Supabase URL and keys
- Check project is active
- Ensure RLS policies allow access

### Authentication Fails
- Clear cookies and local storage
- Verify user exists in Supabase
- Check profile row created

### Permission Denied
- Check RLS policies
- Verify user role in database
- Review API authorization logic

## Useful Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev)
- [Zustand Store](https://github.com/pmndrs/zustand)
