import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			// Custom font size system
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],        // 12px
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
				'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
				'2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],   // 30px
				// Mobile specific sizes
				'mobile-xs': ['0.65rem', { lineHeight: '0.875rem' }],  // 10.4px
				'mobile-sm': ['0.75rem', { lineHeight: '1rem' }],      // 12px
				'mobile-base': ['0.875rem', { lineHeight: '1.25rem' }] // 14px
			},
			// Custom spacing system
			spacing: {
				'icon-xs': '0.75rem',    // 12px - Extra small icons
				'icon-sm': '1rem',       // 16px - Small icons
				'icon-md': '1.25rem',    // 20px - Medium icons
				'icon-lg': '1.5rem',     // 24px - Large icons
				'mobile-1': '0.25rem',   // 4px
				'mobile-2': '0.5rem',    // 8px
				'mobile-3': '0.75rem',   // 12px
				'mobile-4': '1rem',      // 16px
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				mediator: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
