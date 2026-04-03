import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'TAEnglish — API Documentation',
    version: '1.0.0',
    description:
      '**TAEnglish** platform REST API.\n\n> Created by **Nguyễn Tài Anh (Leon Nguyen)**\n\nAll `/api/admin/*` routes require an admin session cookie. All auth-protected routes require a valid Supabase session (cookie-based from the web app).',
    contact: {
      name: 'Nguyễn Tài Anh (Leon Nguyen)',
    },
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local Dev' },
    { url: 'https://ta-english.com', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication & current user info' },
    { name: 'Courses', description: 'Public course catalog' },
    { name: 'Progress', description: 'User lesson progress tracking' },
    { name: 'Audio', description: 'Protected audio streaming' },
    { name: 'Admin — Courses', description: 'Admin CRUD for courses' },
    { name: 'Admin — Sections', description: 'Admin CRUD for sections' },
    { name: 'Admin — Lessons', description: 'Admin CRUD for lessons & media' },
    { name: 'Admin — Users', description: 'Admin user management' },
    { name: 'Admin — Enrollments', description: 'Admin enrollment management' },
    { name: 'Admin — Dashboard', description: 'Admin platform statistics' },
    { name: 'Upload', description: 'Media upload (Cloudinary)' },
  ],
  components: {
    schemas: {
      // ─── Enums ───────────────────────────────────────────────────────────
      CourseLevel: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
        description: 'Difficulty level of the course',
      },
      CourseStatus: {
        type: 'string',
        enum: ['draft', 'published', 'archived'],
      },
      LessonType: {
        type: 'string',
        enum: ['listening', 'vocabulary', 'grammar', 'speaking', 'reading', 'writing', 'quiz'],
      },
      MediaType: {
        type: 'string',
        enum: ['audio', 'video', 'image', 'document'],
      },
      MediaSourceType: {
        type: 'string',
        enum: ['supabase_storage', 'cloudinary', 'youtube', 'external_url'],
      },
      EnrollmentStatus: {
        type: 'string',
        enum: ['active', 'completed', 'expired', 'cancelled'],
      },
      UserRole: {
        type: 'string',
        enum: ['user', 'admin'],
      },
      // ─── Core Entities ───────────────────────────────────────────────────
      Course: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Tiếng Anh Giao Tiếp Cơ Bản' },
          slug: { type: 'string', example: 'tieng-anh-giao-tiep-co-ban' },
          description: { type: 'string', nullable: true },
          thumbnail_url: { type: 'string', nullable: true },
          level: { $ref: '#/components/schemas/CourseLevel' },
          status: { $ref: '#/components/schemas/CourseStatus' },
          order_index: { type: 'integer', default: 0 },
          price: { type: 'number', default: 0 },
          original_price: { type: 'number', default: 0 },
          enrolled_count: { type: 'integer', default: 0 },
          total_lessons: { type: 'integer', default: 0 },
          metadata: { type: 'object' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CourseListItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          thumbnail_url: { type: 'string', nullable: true },
          level: { type: 'string' },
          totalLessons: { type: 'integer' },
          enrolled_users: { type: 'integer' },
          progress: { type: 'number', description: 'Completion % for the authenticated user (0-100)' },
        },
      },
      CourseWithSections: {
        allOf: [
          { $ref: '#/components/schemas/Course' },
          {
            type: 'object',
            properties: {
              sections: {
                type: 'array',
                items: { $ref: '#/components/schemas/SectionWithLessons' },
              },
            },
          },
        ],
      },
      Section: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          course_id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Unit 1 — Greetings' },
          slug: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          order_index: { type: 'integer' },
          total_lessons: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      SectionWithLessons: {
        allOf: [
          { $ref: '#/components/schemas/Section' },
          {
            type: 'object',
            properties: {
              lessons: { type: 'array', items: { $ref: '#/components/schemas/LessonWithMedia' } },
            },
          },
        ],
      },
      Lesson: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          section_id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          slug: { type: 'string', nullable: true },
          description: { type: 'string', nullable: true },
          lesson_type: { $ref: '#/components/schemas/LessonType' },
          order_index: { type: 'integer' },
          duration_seconds: { type: 'integer' },
          is_free: { type: 'boolean' },
          is_published: { type: 'boolean' },
          content_url: { type: 'string', nullable: true },
          metadata: { type: 'object' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      LessonWithMedia: {
        allOf: [
          { $ref: '#/components/schemas/Lesson' },
          {
            type: 'object',
            properties: {
              media: { type: 'array', items: { $ref: '#/components/schemas/LessonMedia' } },
              vocabularies: { type: 'array', items: { $ref: '#/components/schemas/Vocabulary' } },
            },
          },
        ],
      },
      LessonMedia: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          lesson_id: { type: 'string', format: 'uuid' },
          media_type: { $ref: '#/components/schemas/MediaType' },
          title: { type: 'string', nullable: true },
          url: { type: 'string' },
          source_type: { $ref: '#/components/schemas/MediaSourceType' },
          order_index: { type: 'integer' },
          file_size_bytes: { type: 'integer', nullable: true },
          duration_seconds: { type: 'integer', nullable: true },
          mime_type: { type: 'string', nullable: true },
          metadata: { type: 'object' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Vocabulary: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          lesson_id: { type: 'string', format: 'uuid' },
          word: { type: 'string', example: 'fluent' },
          phonetic: { type: 'string', nullable: true, example: '/ˈfluːənt/' },
          meaning_vi: { type: 'string', nullable: true, example: 'thành thạo' },
          meaning_en: { type: 'string', nullable: true, example: 'able to speak smoothly' },
          example_sentence: { type: 'string', nullable: true },
          audio_url: { type: 'string', nullable: true },
          order_index: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Profile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          full_name: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email', nullable: true },
          avatar_url: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true },
          bio: { type: 'string', nullable: true },
          role: { $ref: '#/components/schemas/UserRole' },
          preferred_language: { type: 'string', enum: ['vi', 'en'] },
          preferred_theme: { type: 'string', enum: ['light', 'dark'] },
          is_active: { type: 'boolean' },
          last_login_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      UserWithAuth: {
        allOf: [
          { $ref: '#/components/schemas/Profile' },
          {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              last_sign_in_at: { type: 'string', format: 'date-time', nullable: true },
              enrolled_courses_count: { type: 'integer' },
              completed_lessons_count: { type: 'integer' },
            },
          },
        ],
      },
      Enrollment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          course_id: { type: 'string', format: 'uuid' },
          status: { $ref: '#/components/schemas/EnrollmentStatus' },
          enrolled_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true },
          expires_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      UserProgress: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user_id: { type: 'string', format: 'uuid' },
          lesson_id: { type: 'string', format: 'uuid' },
          is_completed: { type: 'boolean' },
          listen_count: { type: 'integer' },
          time_spent_seconds: { type: 'integer' },
          progress_percent: { type: 'number' },
          last_accessed_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      // ─── Responses ──────────────────────────────────────────────────────
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Something went wrong' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: {} },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalCourses: { type: 'integer' },
          totalUsers: { type: 'integer' },
          totalEnrollments: { type: 'integer' },
          totalRevenue: { type: 'number' },
          recentEnrollments: { type: 'array', items: { $ref: '#/components/schemas/Enrollment' } },
        },
      },
    },
    parameters: {
      pageParam: { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      pageSizeParam: { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 50 } },
      sortParam: { name: 'sort', in: 'query', schema: { type: 'string' } },
      orderParam: { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
      searchParam: { name: 'search', in: 'query', schema: { type: 'string' } },
    },
  },
  paths: {
    // ─── AUTH ────────────────────────────────────────────────────────────────
    '/api/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user role',
        description: 'Returns the role and userId of the currently authenticated user. Returns `{ role: "guest" }` if not logged in.',
        responses: {
          200: {
            description: 'User role info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    role: { type: 'string', enum: ['guest', 'user', 'admin'] },
                    userId: { type: 'string', format: 'uuid' },
                  },
                },
                example: { role: 'user', userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
              },
            },
          },
        },
      },
    },
    // ─── AUTH CALLBACK ───────────────────────────────────────────────────────
    '/api/auth/callback': {
      get: {
        tags: ['Auth'],
        summary: 'OAuth callback handler',
        description: 'Handles Supabase OAuth redirect. Called automatically by Supabase after login.',
        parameters: [
          { name: 'code', in: 'query', required: false, schema: { type: 'string' } },
          { name: 'next', in: 'query', required: false, schema: { type: 'string', default: '/dashboard' } },
        ],
        responses: {
          302: { description: 'Redirects to the app after successful auth' },
        },
      },
    },
    // ─── COURSES (Public) ────────────────────────────────────────────────────
    '/api/courses': {
      get: {
        tags: ['Courses'],
        summary: 'List all published courses',
        description: 'Returns all published courses. If user is authenticated, each course includes their `progress` percentage.',
        responses: {
          200: {
            description: 'List of courses',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/CourseListItem' } },
              },
            },
          },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
        },
      },
    },
    '/api/courses/{courseId}': {
      get: {
        tags: ['Courses'],
        summary: 'Get course with sections & lessons',
        description: 'Returns a full course object including all sections and their lessons (with media and vocabularies).',
        parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: 'Course with sections',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CourseWithSections' } } },
          },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } },
        },
      },
    },
    // ─── PROGRESS ────────────────────────────────────────────────────────────
    '/api/progress': {
      post: {
        tags: ['Progress'],
        summary: 'Update lesson progress',
        description: 'Creates or updates lesson completion for the current user. **Requires authentication.**',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lessonId'],
                properties: {
                  lessonId: { type: 'string', format: 'uuid' },
                  isCompleted: { type: 'boolean', default: true },
                },
              },
              example: { lessonId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', isCompleted: true },
            },
          },
        },
        responses: {
          200: {
            description: 'Progress updated',
            content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } },
          },
          401: { description: 'Unauthorized' },
          400: { description: 'Missing lessonId' },
        },
      },
    },
    // ─── AUDIO ───────────────────────────────────────────────────────────────
    '/api/audio/{speed}/{partId}': {
      get: {
        tags: ['Audio'],
        summary: 'Stream lesson audio',
        description: 'Returns the audio for a lesson. Redirects to Supabase Storage public URL. **Requires authentication.**',
        parameters: [
          { name: 'speed', in: 'path', required: true, schema: { type: 'string', enum: ['normal', 'slow'], default: 'normal' }, description: 'Playback speed hint (handled by client)' },
          { name: 'partId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Lesson ID' },
        ],
        responses: {
          302: { description: 'Redirect to public audio URL' },
          401: { description: 'Unauthorized' },
          404: { description: 'Audio not found', content: { 'application/json': { schema: { type: 'object', properties: { error: { type: 'string' }, fallback: { type: 'string' } } } } } },
        },
      },
    },
    // ─── ADMIN — DASHBOARD ───────────────────────────────────────────────────
    '/api/admin/dashboard': {
      get: {
        tags: ['Admin — Dashboard'],
        summary: 'Get platform statistics',
        description: 'Returns total counts and recent enrollments for the admin dashboard.',
        responses: {
          200: {
            description: 'Dashboard stats',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DashboardStats' } } },
          },
        },
      },
    },
    // ─── ADMIN — COURSES ─────────────────────────────────────────────────────
    '/api/admin/courses': {
      get: {
        tags: ['Admin — Courses'],
        summary: 'List all courses (admin)',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/pageSizeParam' },
          { $ref: '#/components/parameters/sortParam' },
          { $ref: '#/components/parameters/orderParam' },
          { $ref: '#/components/parameters/searchParam' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'published', 'draft', 'archived'] } },
          { name: 'level', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'Paginated courses',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } },
          },
        },
      },
      post: {
        tags: ['Admin — Courses'],
        summary: 'Create a new course',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'level'],
                properties: {
                  title: { type: 'string', example: 'Tiếng Anh Giao Tiếp Cơ Bản' },
                  description: { type: 'string' },
                  level: { $ref: '#/components/schemas/CourseLevel' },
                  status: { $ref: '#/components/schemas/CourseStatus' },
                  order_index: { type: 'integer', default: 0 },
                  price: { type: 'number', default: 0 },
                  original_price: { type: 'number', default: 0 },
                  thumbnail_url: { type: 'string' },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Course created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
          400: { description: 'Missing required fields' },
        },
      },
    },
    '/api/admin/courses/{id}': {
      get: {
        tags: ['Admin — Courses'],
        summary: 'Get a single course (admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Course', content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } } },
      },
      patch: {
        tags: ['Admin — Courses'],
        summary: 'Update a course',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Course' } } } },
        responses: { 200: { description: 'Updated course' } },
      },
      delete: {
        tags: ['Admin — Courses'],
        summary: 'Delete a course',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' } } } } } } },
      },
    },
    // ─── ADMIN — SECTIONS ────────────────────────────────────────────────────
    '/api/admin/sections': {
      get: {
        tags: ['Admin — Sections'],
        summary: 'List sections',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/pageSizeParam' },
          { $ref: '#/components/parameters/sortParam' },
          { $ref: '#/components/parameters/orderParam' },
          { $ref: '#/components/parameters/searchParam' },
          { name: 'course_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'Paginated sections', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
      },
      post: {
        tags: ['Admin — Sections'],
        summary: 'Create a section',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['course_id', 'title'],
                properties: {
                  course_id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  order_index: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created' } },
      },
    },
    '/api/admin/sections/{id}': {
      get: {
        tags: ['Admin — Sections'],
        summary: 'Get a section',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Section', content: { 'application/json': { schema: { $ref: '#/components/schemas/Section' } } } } },
      },
      patch: {
        tags: ['Admin — Sections'],
        summary: 'Update a section',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Section' } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Admin — Sections'],
        summary: 'Delete a section',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    // ─── ADMIN — LESSONS ─────────────────────────────────────────────────────
    '/api/admin/lessons': {
      get: {
        tags: ['Admin — Lessons'],
        summary: 'List lessons',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/pageSizeParam' },
          { $ref: '#/components/parameters/sortParam' },
          { $ref: '#/components/parameters/orderParam' },
          { $ref: '#/components/parameters/searchParam' },
          { name: 'section_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'Paginated lessons', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
      },
      post: {
        tags: ['Admin — Lessons'],
        summary: 'Create a lesson',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['section_id', 'title', 'lesson_type'],
                properties: {
                  section_id: { type: 'string', format: 'uuid' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  lesson_type: { $ref: '#/components/schemas/LessonType' },
                  order_index: { type: 'integer' },
                  duration_seconds: { type: 'integer' },
                  is_free: { type: 'boolean' },
                  is_published: { type: 'boolean' },
                  metadata: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } } } },
      },
    },
    '/api/admin/lessons/{id}': {
      get: {
        tags: ['Admin — Lessons'],
        summary: 'Get a lesson',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Lesson', content: { 'application/json': { schema: { $ref: '#/components/schemas/LessonWithMedia' } } } } },
      },
      patch: {
        tags: ['Admin — Lessons'],
        summary: 'Update a lesson',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } } },
        responses: { 200: { description: 'Updated' } },
      },
      delete: {
        tags: ['Admin — Lessons'],
        summary: 'Delete a lesson',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    '/api/admin/lessons/{id}/media': {
      post: {
        tags: ['Admin — Lessons'],
        summary: 'Add media to a lesson',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['media_type', 'url', 'source_type'],
                properties: {
                  media_type: { $ref: '#/components/schemas/MediaType' },
                  title: { type: 'string' },
                  url: { type: 'string' },
                  source_type: { $ref: '#/components/schemas/MediaSourceType' },
                  order_index: { type: 'integer' },
                  file_size_bytes: { type: 'integer' },
                  duration_seconds: { type: 'integer' },
                  mime_type: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Media added', content: { 'application/json': { schema: { $ref: '#/components/schemas/LessonMedia' } } } } },
      },
    },
    '/api/admin/media/{mediaId}': {
      delete: {
        tags: ['Admin — Lessons'],
        summary: 'Delete a media item',
        parameters: [{ name: 'mediaId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    // ─── ADMIN — USERS ───────────────────────────────────────────────────────
    '/api/admin/users': {
      get: {
        tags: ['Admin — Users'],
        summary: 'List all users',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/pageSizeParam' },
          { $ref: '#/components/parameters/sortParam' },
          { $ref: '#/components/parameters/orderParam' },
          { $ref: '#/components/parameters/searchParam' },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['all', 'user', 'admin'] } },
        ],
        responses: {
          200: {
            description: 'Users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/UserWithAuth' } },
                    total: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Admin — Users'],
        summary: "Update a user's role",
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'role'],
                properties: {
                  userId: { type: 'string', format: 'uuid' },
                  role: { $ref: '#/components/schemas/UserRole' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Role updated' } },
      },
    },
    '/api/admin/users/{id}': {
      delete: {
        tags: ['Admin — Users'],
        summary: 'Delete a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' } },
      },
    },
    // ─── ADMIN — ENROLLMENTS ─────────────────────────────────────────────────
    '/api/admin/enrollments': {
      get: {
        tags: ['Admin — Enrollments'],
        summary: 'List all enrollments',
        parameters: [
          { $ref: '#/components/parameters/pageParam' },
          { $ref: '#/components/parameters/pageSizeParam' },
          { name: 'course_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'user_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { $ref: '#/components/schemas/EnrollmentStatus' } },
        ],
        responses: { 200: { description: 'Enrollments', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedResponse' } } } } },
      },
    },
    // ─── UPLOAD ──────────────────────────────────────────────────────────────
    '/api/upload/image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload an image to Cloudinary',
        description: 'Accepts `multipart/form-data` with a `file` field. Returns the Cloudinary URL and public_id.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    public_id: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export async function GET() {
  return NextResponse.json(spec)
}
