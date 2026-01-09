
import unittest
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta, timezone
import sys
import os

# Add backend to path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock supabase module BEFORE importing app
mock_supabase_module = MagicMock()
sys.modules['supabase'] = mock_supabase_module

# Also mock flask, flask_cors, dotenv since they might be missing too if we are consistently failing
sys.modules['flask'] = MagicMock()
sys.modules['flask_cors'] = MagicMock()
sys.modules['werkzeug.utils'] = MagicMock()
sys.modules['dotenv'] = MagicMock()

# Determine where app is
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import is_pro_user, app

class TestProUserCheck(unittest.TestCase):
    def setUp(self):
        # Setup mock for supabase client inside app
        self.mock_supabase = MagicMock()
        # We need to inject this mock into app.supabase
        import app as app_module
        app_module.supabase = self.mock_supabase

    def test_permanent_pro(self):
        # Case 1: is_pro = True
        self.mock_supabase.table().select().eq().execute.return_value.data = [{'is_pro': True, 'pro_expires_at': None}]
        self.assertTrue(is_pro_user('user1'))

    def test_not_pro_no_expiry(self):
        # Case 2: is_pro = False, no expiry
        self.mock_supabase.table().select().eq().execute.return_value.data = [{'is_pro': False, 'pro_expires_at': None}]
        self.assertFalse(is_pro_user('user2'))

    def test_pro_valid_expiry(self):
        # Case 3: is_pro = False, valid expiry (tomorrow)
        future_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        self.mock_supabase.table().select().eq().execute.return_value.data = [{'is_pro': False, 'pro_expires_at': future_date}]
        self.assertTrue(is_pro_user('user3'))

    def test_pro_expired(self):
        # Case 4: is_pro = False, expired (yesterday)
        past_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        self.mock_supabase.table().select().eq().execute.return_value.data = [{'is_pro': False, 'pro_expires_at': past_date}]
        self.assertFalse(is_pro_user('user4'))
        
    def test_pro_expiry_with_z(self):
        # Case 5: Handle Z format manually if needed
        future_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat().replace('+00:00', 'Z')
        self.mock_supabase.table().select().eq().execute.return_value.data = [{'is_pro': False, 'pro_expires_at': future_date}]
        self.assertTrue(is_pro_user('user5'))

if __name__ == '__main__':
    unittest.main()
