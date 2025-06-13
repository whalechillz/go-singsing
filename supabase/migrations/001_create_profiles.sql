-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'customer')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow users to update their own profile (except role)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'staff');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample users (passwords should be changed after first login)
-- Admin user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('admin@singsinggolf.com', crypt('admin123!', gen_salt('bf')), NOW(), 'authenticated');

-- Manager user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('manager@singsinggolf.com', crypt('manager123!', gen_salt('bf')), NOW(), 'authenticated');

-- Staff user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role)
VALUES ('staff@singsinggolf.com', crypt('staff123!', gen_salt('bf')), NOW(), 'authenticated');

-- Update profiles with correct roles
UPDATE public.profiles SET role = 'admin', name = '관리자' WHERE email = 'admin@singsinggolf.com';
UPDATE public.profiles SET role = 'manager', name = '매니저' WHERE email = 'manager@singsinggolf.com';
UPDATE public.profiles SET role = 'staff', name = '스탭' WHERE email = 'staff@singsinggolf.com';
