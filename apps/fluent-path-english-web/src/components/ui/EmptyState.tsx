'use client';

import { cn } from '@/lib/utils';
import { FileQuestion, BookOpen, Users, Search } from 'lucide-react';

type EmptyStateVariant = 'courses' | 'lessons' | 'users' | 'search' | 'general';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

const defaultContent: Record<EmptyStateVariant, { title: string; message: string; icon: React.ElementType }> = {
  courses: {
    title: 'No courses yet',
    message: 'There are no courses available at the moment. Check back soon!',
    icon: BookOpen,
  },
  lessons: {
    title: 'No content available',
    message: 'This section doesn\'t have any lessons yet. The instructor may still be preparing the content.',
    icon: FileQuestion,
  },
  users: {
    title: 'No users found',
    message: 'No users match your current filters. Try adjusting your search.',
    icon: Users,
  },
  search: {
    title: 'No results found',
    message: 'We couldn\'t find anything matching your search. Try different keywords.',
    icon: Search,
  },
  general: {
    title: 'Nothing here',
    message: 'There\'s no content to display right now.',
    icon: FileQuestion,
  },
};

export function EmptyState({
  variant = 'general',
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  const content = defaultContent[variant];
  const Icon = content.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center',
        className,
      )}
    >
      <div className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-5 mb-6">
        <Icon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title || content.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {message || content.message}
      </p>
      {action}
    </div>
  );
}
