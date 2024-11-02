// app/services/gameService.ts
import { supabase } from '../utils/supabase/supabaseClient';

export const createGame = async (creatorId: string | null) => {
  const { data, error } = await supabase
    .from('tictactoe_games')
    .insert([
      {
        squares: Array(9).fill(null),
        x_is_next: true,
        status: 'waiting',
        creator_id: creatorId,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchActiveGames = async (userId: string) => {
  const { data, error } = await supabase
    .from('tictactoe_games')
    .select('*')
    .eq('status', 'waiting')
    .neq('creator_id', userId);

  if (error) throw error;
  return data;
};

export const fetchYourGames = async (userId: string) => {
  const { data, error } = await supabase
    .from('tictactoe_games')
    .select('*')
    .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const subscribeToYourGames = (
  onUpdate: () => void
) => {
  const channel = supabase
    .channel('your_games_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tictactoe_games',
      },
      () => {
        onUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
type GameData = {
  status: string;
  id: string;
  squares: SquareValue[];
  x_is_next: boolean;
  creator_id: string;
  opponent_id: string | null;
};
type SquareValue = "X" | "O" | null;

export const fetchGameById = async (gameId: string) => {
  const { data, error } = await supabase
    .from('tictactoe_games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateGame = async (gameId: string, updates: Partial<GameData>) => {
  const { error } = await supabase
    .from('tictactoe_games')
    .update(updates)
    .eq('id', gameId);

  if (error) {
    throw error;
  }
};

export const subscribeToGameUpdates = (
  gameId: string,
  onUpdate: (newData: GameData) => void
) => {
  const channel = supabase
    .channel(`game_${gameId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tictactoe_games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        const newData = payload.new as GameData;
        onUpdate(newData);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};