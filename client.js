const SUPABASE_URL = 'https://fokhpbbmqypsvwpfvfjf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZva2hwYmJtcXlwc3Z3cGZ2ZmpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjM1ODIsImV4cCI6MjA3MDIzOTU4Mn0.ghPtG2rA5IKE0uLU-6AzURdy3EDun1ARDmcJz2tjsg0';

// The global supabase variable is created by the script tag in the HTML
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);