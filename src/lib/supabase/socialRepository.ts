import { supabase } from './client';
import type { PixProfile } from '../../types/social';

export async function upsertRecentFriend(
  ownerId: string,
  name: string,
  initials: string,
  backgroundColor: string,
  amountInCents: number,
) {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from('recent_friends')
    .select('id, total_bills, total_in_cents')
    .eq('owner_id', ownerId)
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('recent_friends')
      .update({
        total_bills: existing.total_bills + 1,
        total_in_cents: existing.total_in_cents + amountInCents,
        last_seen_at: now,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('recent_friends').insert({
      owner_id: ownerId,
      name,
      initials,
      background_color: backgroundColor,
      total_bills: 1,
      total_in_cents: amountInCents,
      first_seen_at: now,
      last_seen_at: now,
    });
  }
}

export async function listRecentFriends(ownerId: string) {
  const { data, error } = await supabase
    .from('recent_friends')
    .select('*')
    .eq('owner_id', ownerId)
    .order('last_seen_at', { ascending: false })
    .limit(12);

  if (error) throw new Error(`Erro ao listar amigos: ${error.message}`);
  return data ?? [];
}

export async function upsertRestaurant(
  ownerId: string,
  name: string,
  totalInCents: number,
) {
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from('restaurant_history')
    .select('id, total_bills, total_in_cents')
    .eq('owner_id', ownerId)
    .eq('name', name)
    .maybeSingle();

  if (existing) {
    const nextTotalBills = existing.total_bills + 1;
    const nextTotalInCents = existing.total_in_cents + totalInCents;
    await supabase
      .from('restaurant_history')
      .update({
        total_bills: nextTotalBills,
        total_in_cents: nextTotalInCents,
        average_ticket_in_cents: Math.round(nextTotalInCents / nextTotalBills),
        last_visited_at: now,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('restaurant_history').insert({
      owner_id: ownerId,
      name,
      total_bills: 1,
      total_in_cents: totalInCents,
      average_ticket_in_cents: totalInCents,
      first_visited_at: now,
      last_visited_at: now,
    });
  }
}

export async function listRestaurants(ownerId: string) {
  const { data, error } = await supabase
    .from('restaurant_history')
    .select('*')
    .eq('owner_id', ownerId)
    .order('last_visited_at', { ascending: false })
    .limit(16);

  if (error) throw new Error(`Erro ao listar restaurantes: ${error.message}`);
  return data ?? [];
}

export async function upsertRecurringGroup(
  ownerId: string,
  name: string,
  memberNames: string[],
) {
  const now = new Date().toISOString();
  const sortedMembers = [...memberNames].sort((a, b) => a.localeCompare(b));

  const { data: groups } = await supabase
    .from('recurring_groups')
    .select('id, bill_count')
    .eq('owner_id', ownerId)
    .eq('name', name);

  const matchingGroup = groups?.find((g) => g !== null) ?? null;

  if (matchingGroup) {
    await supabase
      .from('recurring_groups')
      .update({ bill_count: matchingGroup.bill_count + 1, last_used_at: now })
      .eq('id', matchingGroup.id);
    return matchingGroup.id;
  }

  const { data: newGroup, error } = await supabase
    .from('recurring_groups')
    .insert({ owner_id: ownerId, name, last_used_at: now })
    .select('id')
    .single();

  if (error || !newGroup) {
    throw new Error(`Erro ao criar grupo: ${error?.message ?? 'resposta vazia'}`);
  }

  if (sortedMembers.length > 0) {
    await supabase.from('recurring_group_members').insert(
      sortedMembers.map((memberName) => ({ group_id: newGroup.id, name: memberName })),
    );
  }

  return newGroup.id;
}

export async function listRecurringGroups(ownerId: string) {
  const { data: groups, error } = await supabase
    .from('recurring_groups')
    .select('*, recurring_group_members(name)')
    .eq('owner_id', ownerId)
    .order('last_used_at', { ascending: false })
    .limit(10);

  if (error) throw new Error(`Erro ao listar grupos: ${error.message}`);
  return groups ?? [];
}

export async function loadPixProfile(userId: string): Promise<PixProfile | null> {
  const { data } = await supabase
    .from('pix_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return null;

  return {
    key: data.key,
    keyType: data.key_type as PixProfile['keyType'],
    receiverName: data.receiver_name,
    city: data.city,
    description: data.description,
    txidPrefix: data.txid_prefix,
  };
}

export async function savePixProfile(userId: string, profile: PixProfile) {
  const { error } = await supabase.from('pix_profiles').upsert(
    {
      user_id: userId,
      key: profile.key,
      key_type: profile.keyType,
      receiver_name: profile.receiverName,
      city: profile.city,
      description: profile.description,
      txid_prefix: profile.txidPrefix,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error(`Erro ao salvar perfil Pix: ${error.message}`);
}

export async function loadAnalyticsConsent(userId: string) {
  const { data } = await supabase
    .from('analytics_consents')
    .select('consented')
    .eq('user_id', userId)
    .maybeSingle();

  return data?.consented ?? false;
}

export async function saveAnalyticsConsent(userId: string, consented: boolean) {
  const now = new Date().toISOString();
  const { error } = await supabase.from('analytics_consents').upsert(
    {
      user_id: userId,
      consented,
      consented_at: consented ? now : null,
      revoked_at: consented ? null : now,
    },
    { onConflict: 'user_id' },
  );

  if (error) throw new Error(`Erro ao salvar consentimento: ${error.message}`);
}
