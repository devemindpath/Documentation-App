import { Request, Response } from 'express';
import { User, UserResponse, HealthCheckResponse } from '../types';
import { supabase } from '../config/supabase';

// Add this constant at the top of the file after imports
const USERS_TABLE = 'users';

/**
 * Add user data after sign-in
 * @param req Request object containing user data
 * @param res Response object
 */
export const addUserData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract user data from request body
    const userData: User = req.body;
    
    if (!userData || !userData.email || !userData.name || !userData.userId) {
      res.status(400).json({
        success: false,
        error: 'User data is required with at least name and email',
      } as UserResponse);
      return;
    }

    // Add timestamps
    const now = new Date().toISOString();
    const userWithTimestamps: User = {
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    // Check if user already exists in the database
    const { data: existingUser, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select('id, email, userId')
      .eq('email', userData.email)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      throw new Error(`Error checking for existing user: ${fetchError.message}`);
    }
    
    let result;
    
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .update({
          name: userData.name,
          profilePicture: userData.profilePicture,
          updatedAt: now
        })
        .eq('userId', existingUser.userId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error updating user: ${error.message}`);
      }
      
      result = data;
    } else {
      // Insert new user
      const { data, error } = await supabase
        .from(USERS_TABLE)
        .insert([userWithTimestamps])
        .select()
        .single();
      
      if (error) {
        throw new Error(`Error inserting user: ${error.message}`);
      }
      
      result = data;
    }
    
    console.log('User data saved:', result);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: existingUser ? 'User data updated successfully' : 'User data added successfully',
      user: result,
    } as UserResponse);
  } catch (error) {
    console.error('Error adding user data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error while adding user data',
    } as UserResponse);
  }
};

/**
 * Get user data by email
 * @param req Request object containing email query parameter
 * @param res Response object
 */
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      } as UserResponse);
      return;
    }

    // Query the database for the user
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        res.status(404).json({
          success: false,
          error: 'User not found',
        } as UserResponse);
        return;
      }
      throw new Error(`Error fetching user: ${error.message}`);
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      user: data,
    } as UserResponse);
  } catch (error) {
    console.error('Error getting user data:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error while getting user data',
    } as UserResponse);
  }
};

/**
 * Health check endpoint for testing the API
 * @param req Request object
 * @param res Response object
 */

export const healthCheck = (req: Request, res: Response): void => {
  console.log('Health check called');
  try {
    res.status(200).json({
      success: true,
      status: 'ok',
      message: 'User service is running',
      timestamp: '2025-01-01T00:00:00.000Z',
      database: 'connected',
      version: '1.0.0',
      environment: 'production'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Dummy error',
      timestamp: '2025-01-01T00:00:00.000Z'
    });
  }
};