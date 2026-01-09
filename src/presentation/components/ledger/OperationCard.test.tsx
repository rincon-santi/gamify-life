import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OperationCard } from './OperationCard';
import type { Operation } from '../../../domain/logic';
import { useSocietyStore } from '../../../application/store';

// Mock the store
vi.mock('../../../application/store', () => ({
    useSocietyStore: vi.fn(),
}));

describe('OperationCard', () => {
    it('renders operation details correctly', () => {
        // Mock store return for affordability check
        (useSocietyStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
            // Mock resources for affordability check: always affordable
            if (selector.toString().includes('resources')) return { INFLUENCE: 100, ORDER: 100, CONNECTION: 100 };
            return vi.fn(); // Mock logic
        });

        const op: Operation = {
            id: '1',
            title: 'Test Op',
            description: 'Description',
            type: 'ACTION',
            cost: { INFLUENCE: 10 },
            rewards: { resources: { ORDER: 5 } }
        };

        render(<OperationCard operation={op} />);

        expect(screen.getByText('Test Op')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
        expect(screen.getByText('-10')).toBeInTheDocument(); // Cost
        expect(screen.getByText('+5')).toBeInTheDocument();  // Reward
    });


    it('shows grayed out state if unaffordable', () => {
        // Mock store: NOT affordable
        (useSocietyStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) => {
            if (selector.toString().includes('resources')) return { INFLUENCE: 0, ORDER: 0, CONNECTION: 0 };
            return vi.fn();
        });

        const op: Operation = {
            id: '1',
            title: 'Expensive Op',
            description: 'Desc',
            type: 'ACTION',
            cost: { INFLUENCE: 999 } // Unaffordable
        };

        const { container } = render(<OperationCard operation={op} />);

        // Tailwind class check for grayscale/opacity
        // Note: This relies on implementation detail (class names)
        expect(container.firstChild).toHaveClass('opacity-50');
        expect(container.firstChild).toHaveClass('grayscale');
    });
});
