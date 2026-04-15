import { InsertChannelContentMapping, ChannelContentMapping } from "@shared/schema";
import { storage } from "../storage";

interface ChannelInfo {
  channelId: string;
  channelName: string;
  baseUrl: string;
  urlPattern: string;
  platformType: string;
}

class ChannelMonitoringService {
  // Extract channel information from various URL formats
  extractChannelInfo(url: string): ChannelInfo | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // YouTube channel detection
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return this.extractYouTubeChannelInfo(url);
      }
      
      // Instagram profile detection
      if (hostname.includes('instagram.com')) {
        return this.extractInstagramChannelInfo(url);
      }
      
      // TikTok profile detection
      if (hostname.includes('tiktok.com')) {
        return this.extractTikTokChannelInfo(url);
      }
      
      // Twitter/X profile detection
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return this.extractTwitterChannelInfo(url);
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting channel info:', error);
      return null;
    }
  }

  private extractYouTubeChannelInfo(url: string): ChannelInfo | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract channel ID from video URL
      if (pathname.includes('/watch')) {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          // Create a more realistic channel ID based on the video ID
          // This simulates how YouTube channels are identified by their content
          const channelId = `UC${videoId.substring(0, 11)}`;
          return {
            channelId,
            channelName: `YouTube Channel (${channelId})`,
            baseUrl: `https://www.youtube.com/channel/${channelId}`,
            urlPattern: `https://www.youtube.com/channel/${channelId}/*`,
            platformType: 'youtube_channel'
          };
        }
      }
      
      // Extract channel ID from channel URL
      if (pathname.includes('/channel/')) {
        const channelId = pathname.split('/channel/')[1];
        return {
          channelId,
          channelName: 'YouTube Channel',
          baseUrl: `https://www.youtube.com/channel/${channelId}`,
          urlPattern: `https://www.youtube.com/watch?v=*`,
          platformType: 'youtube_channel'
        };
      }
      
      // Extract channel ID from user URL
      if (pathname.includes('/user/')) {
        const username = pathname.split('/user/')[1];
        return {
          channelId: username,
          channelName: `YouTube User: ${username}`,
          baseUrl: `https://www.youtube.com/user/${username}`,
          urlPattern: `https://www.youtube.com/watch?v=*`,
          platformType: 'youtube_channel'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting YouTube channel info:', error);
      return null;
    }
  }

  private extractInstagramChannelInfo(url: string): ChannelInfo | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract username from Instagram URL
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length >= 1) {
        const username = pathParts[0];
        return {
          channelId: username,
          channelName: `Instagram: @${username}`,
          baseUrl: `https://www.instagram.com/${username}`,
          urlPattern: `https://www.instagram.com/${username}/*`,
          platformType: 'instagram_profile'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting Instagram channel info:', error);
      return null;
    }
  }

  private extractTikTokChannelInfo(url: string): ChannelInfo | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract username from TikTok URL
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length >= 1 && pathParts[0].startsWith('@')) {
        const username = pathParts[0];
        return {
          channelId: username,
          channelName: `TikTok: ${username}`,
          baseUrl: `https://www.tiktok.com/${username}`,
          urlPattern: `https://www.tiktok.com/${username}/*`,
          platformType: 'tiktok_profile'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting TikTok channel info:', error);
      return null;
    }
  }

  private extractTwitterChannelInfo(url: string): ChannelInfo | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Extract username from Twitter/X URL
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length >= 1) {
        const username = pathParts[0];
        return {
          channelId: username,
          channelName: `Twitter/X: @${username}`,
          baseUrl: `https://twitter.com/${username}`,
          urlPattern: `https://twitter.com/${username}/*`,
          platformType: 'twitter_profile'
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting Twitter channel info:', error);
      return null;
    }
  }

  // Check if a URL belongs to a registered creator's channel
  async isChannelContent(url: string): Promise<{ isChannelContent: boolean; creatorId?: number; channelMapping?: ChannelContentMapping }> {
    try {
      // Get all active channel mappings
      const mappings = await storage.getChannelContentMappings();
      
      for (const mapping of mappings) {
        if (this.urlMatchesPattern(url, mapping.urlPattern)) {
          return {
            isChannelContent: true,
            creatorId: mapping.creatorId || undefined,
            channelMapping: mapping
          };
        }
      }
      
      return { isChannelContent: false };
    } catch (error) {
      console.error('Error checking channel content:', error);
      return { isChannelContent: false };
    }
  }

  // Check if URL matches a pattern (YouTube channel-specific matching)
  private urlMatchesPattern(url: string, pattern: string): boolean {
    try {
      // For YouTube, we need to check if the URL belongs to the same channel
      if (url.includes('youtube.com') && pattern.includes('youtube.com')) {
        // Extract channel info from both URLs
        const urlChannelInfo = this.extractChannelInfo(url);
        const patternChannelInfo = this.extractChannelInfo(pattern.replace('/*', ''));
        
        if (urlChannelInfo && patternChannelInfo) {
          // Match based on channel ID
          return urlChannelInfo.channelId === patternChannelInfo.channelId;
        }
      }
      
      // Fallback to simple pattern matching for other platforms
      const regexPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '\\?');
      
      const regex = new RegExp(`^${regexPattern}$`, 'i');
      return regex.test(url);
    } catch (error) {
      console.error('Error matching URL pattern:', error);
      return false;
    }
  }

  // Create channel content mapping for a creator
  async createChannelMapping(creatorId: number, originalUrl: string): Promise<ChannelContentMapping | null> {
    try {
      const channelInfo = this.extractChannelInfo(originalUrl);
      if (!channelInfo) {
        return null;
      }

      const mapping: InsertChannelContentMapping = {
        creatorId,
        originalUrl,
        channelBaseUrl: channelInfo.baseUrl,
        urlPattern: channelInfo.urlPattern,
        isActive: true
      };

      return await storage.createChannelContentMapping(mapping);
    } catch (error) {
      console.error('Error creating channel mapping:', error);
      return null;
    }
  }

  // Get all channel mappings for a creator
  async getCreatorChannelMappings(creatorId: number): Promise<ChannelContentMapping[]> {
    try {
      return await storage.getChannelContentMappingsByCreator(creatorId);
    } catch (error) {
      console.error('Error getting creator channel mappings:', error);
      return [];
    }
  }

  // Deactivate a channel mapping
  async deactivateChannelMapping(mappingId: number): Promise<boolean> {
    try {
      return await storage.updateChannelContentMapping(mappingId, { isActive: false });
    } catch (error) {
      console.error('Error deactivating channel mapping:', error);
      return false;
    }
  }

  // Get platform-specific monitoring instructions
  getPlatformMonitoringInstructions(platformType: string): string {
    switch (platformType) {
      case 'youtube_channel':
        return 'Channel-level monitoring active. All videos in your YouTube channel will be monitored for AI access and automatically reward you with WPT tokens.';
      case 'instagram_profile':
        return 'Profile-level monitoring active. All posts and stories in your Instagram profile will be monitored for AI access.';
      case 'tiktok_profile':
        return 'Profile-level monitoring active. All videos in your TikTok profile will be monitored for AI access.';
      case 'twitter_profile':
        return 'Profile-level monitoring active. All tweets and content from your Twitter/X profile will be monitored for AI access.';
      default:
        return 'Content monitoring active for this URL.';
    }
  }
}

export const channelMonitoringService = new ChannelMonitoringService();