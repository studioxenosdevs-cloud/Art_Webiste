import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Adjust path as needed
import type { TimelineEvent } from '@/types';

const DEFAULT_SEED_EVENTS = [
    {
        step_number: '01',
        sort_order: 1,
        title: 'Concept & Sacred Geometry',
        subtitle: 'Vision & Spiritual Foundations',
        description: 'Every piece begins with contemplative meditation, selecting Qur’anic verses, and crafting precise geometric compositions.',
        badge: 'Phase 1 · Ideation',
        icon_name: 'Sparkles',
        image_url: ''
    },
    {
        step_number: '02',
        sort_order: 2,
        title: 'Handcrafted Canvas & Gesso',
        subtitle: 'Traditional Surface Prep',
        description: 'Custom wooden stretchers are layered with high-grade cotton canvas and meticulously primed with smooth gesso layers.',
        badge: 'Phase 2 · Craft',
        icon_name: 'PencilRuler',
        image_url: ''
    },
    {
        step_number: '03',
        sort_order: 3,
        title: 'Calligraphy & Pigment Layering',
        subtitle: 'Gold Leaf & Acrylic Application',
        description: 'Traditional Arabic calligraphy is applied using specialized reed pens, metallic acrylics, and genuine 24K gold leaf detailing.',
        badge: 'Phase 3 · Execution',
        icon_name: 'Brush',
        image_url: ''
    },
    {
        step_number: '04',
        sort_order: 4,
        title: 'Varnish & Gallery Framing',
        subtitle: 'Protection & Final Polish',
        description: 'Protective UV archival varnish is sealed onto the canvas before fitting custom floating hardwood frames for exhibition.',
        badge: 'Phase 4 · Completion',
        icon_name: 'Frame',
        image_url: ''
    }
];

export function useStore() {
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch timeline from Supabase
    const fetchTimeline = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('timeline')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            if (data) {
                const formatted: TimelineEvent[] = data.map((item) => ({
                    id: item.id,
                    stepNumber: item.step_number || '01',
                    order: item.sort_order ?? 1,
                    title: item.title || '',
                    subtitle: item.subtitle || '',
                    description: item.description || '',
                    badge: item.badge || '',
                    iconName: item.icon_name || 'Sparkles',
                    imageUrl: item.image_url || '',
                }));
                setTimelineEvents(formatted);
            }
        } catch (err: any) {
            console.error('Error fetching timeline:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimeline();
    }, [fetchTimeline]);

    // Add event
    const addTimelineEvent = async (data: Omit<TimelineEvent, 'id'>) => {
        try {
            const payload = {
                step_number: data.stepNumber,
                sort_order: data.order,
                title: data.title,
                subtitle: data.subtitle || '',
                description: data.description,
                badge: data.badge || '',
                icon_name: data.iconName || 'Sparkles',
                image_url: data.imageUrl || '',
            };

            const { error } = await supabase.from('timeline').insert([payload]);
            if (error) return { error: error.message };

            await fetchTimeline();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Failed to add timeline event.' };
        }
    };

    // Update event
    const updateTimelineEvent = async (id: string, data: Partial<Omit<TimelineEvent, 'id'>>) => {
        try {
            const payload: Record<string, any> = {};
            if (data.stepNumber !== undefined) payload.step_number = data.stepNumber;
            if (data.order !== undefined) payload.sort_order = data.order;
            if (data.title !== undefined) payload.title = data.title;
            if (data.subtitle !== undefined) payload.subtitle = data.subtitle;
            if (data.description !== undefined) payload.description = data.description;
            if (data.badge !== undefined) payload.badge = data.badge;
            if (data.iconName !== undefined) payload.icon_name = data.iconName;
            if (data.imageUrl !== undefined) payload.image_url = data.imageUrl;

            const { error } = await supabase.from('timeline').update(payload).eq('id', id);
            if (error) return { error: error.message };

            await fetchTimeline();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Failed to update timeline event.' };
        }
    };

    // Delete event
    const deleteTimelineEvent = async (id: string) => {
        try {
            const { error } = await supabase.from('timeline').delete().eq('id', id);
            if (error) return { error: error.message };

            await fetchTimeline();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Failed to delete timeline event.' };
        }
    };

    // Seed Default Timeline
    const seedDefaultTimeline = async () => {
        try {
            const { error } = await supabase.from('timeline').insert(DEFAULT_SEED_EVENTS);
            if (error) return { error: error.message };

            await fetchTimeline();
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Failed to seed default timeline.' };
        }
    };

    return {
        timelineEvents,
        loading,
        addTimelineEvent,
        updateTimelineEvent,
        deleteTimelineEvent,
        seedDefaultTimeline,
        refreshTimeline: fetchTimeline,
    };
}
