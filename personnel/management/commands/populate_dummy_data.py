from django.core.management.base import BaseCommand
from personnel.models import Personnel, Section, Assignment, CareerProgression, Qualification
from django.utils import timezone
import random
import datetime

class Command(BaseCommand):
    help = 'Populates the database with 50 dummy personnel records'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating dummy data...')
        
        # 1. Create Sections
        sections = ['Headquarters', 'Logistics', 'Intelligence', 'Operations', 'Signals']
        section_objs = []
        for s_name in sections:
            sec, created = Section.objects.get_or_create(name=s_name)
            section_objs.append(sec)
            
        # 2. Lists for Random Data
        first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Emma', 'Robert', 'Olivia', 'William', 'Ava', 'Joseph', 'Isabella', 'Charles', 'Sophia', 'Thomas', 'Mia', 'Daniel', 'Charlotte']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
        ranks = [c[0] for c in Personnel.RANK_CHOICES]
        states = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Enugu', 'Delta']
        lgas = ['Ikeja', 'Municipal', 'Dala', 'Port Harcourt', 'Ibadan North', 'Kaduna North', 'Enugu North', 'Warri']
        qualifications = ['B.Sc', 'M.Sc', 'Ph.D', 'SSCE', 'OND', 'HND', 'MBA']
        
        # 3. Create 50 Personnel
        for i in range(50):
            # Generate unique service number
            svc_no = f"NA/{random.randint(10, 99)}/{random.randint(1000, 9999)}"
            while Personnel.objects.filter(service_number=svc_no).exists():
                 svc_no = f"NA/{random.randint(10, 99)}/{random.randint(1000, 9999)}"
            

            # Pick a section for assignment
            assigned_section = random.choice(section_objs)
            
            p = Personnel.objects.create(
                service_number=svc_no,
                first_name=random.choice(first_names),
                last_name=random.choice(last_names),
                rank=random.choice(ranks),
                gender=random.choice(['M', 'F']),
                dob=timezone.now().date() - datetime.timedelta(days=random.randint(7000, 15000)),
                marital_status=random.choice(['SINGLE', 'MARRIED']),
                state_of_origin=random.choice(states),
                lga_of_origin=random.choice(lgas),
                date_of_enlistment=timezone.now().date() - datetime.timedelta(days=random.randint(365, 5000)),
            )
            
            # Assignment
            Assignment.objects.create(
                personnel=p,
                disposition='General Duty',
                section=assigned_section,
                sub_unit='Unit A',
                date_of_posting=p.date_of_enlistment,
                status='ACTIVE'
            )
            
            # Career Progression
            CareerProgression.objects.create(
                personnel=p,
                current_rank=p.rank,
                date_of_last_promotion=p.date_of_enlistment + datetime.timedelta(days=random.randint(100, 1000)),
                date_of_last_transfer=p.date_of_enlistment + datetime.timedelta(days=random.randint(50, 500)),
                command_last_served='Depot NA',
                years_in_service=random.randint(1, 20)
            )
            
            # Qualification
            Qualification.objects.create(
                personnel=p,
                educational_qualification=random.choice(qualifications)
            )
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created 50 dummy personnel records.'))
