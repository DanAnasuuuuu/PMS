"""
Management command to load organizational structure from JSON data.
This populates Department, Section, and Designation models.
"""
from django.core.management.base import BaseCommand
from personnel.models import Department, Section, Designation
import json


class Command(BaseCommand):
    help = 'Load organizational structure (departments, sections, designations) from JSON data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            help='Path to JSON file containing organizational data',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before loading',
        )

    def handle(self, *args, **options):
        # Default organizational data
        org_data = {
            "organization": {
                "departments": [
                    {
                        "name": "DIRECTOR OFFICE",
                        "sections": [
                            {
                                "name": "SDS Secretariat",
                                "designations": [
                                    "SDS (State Director Security)",
                                    "P. A. TO SDS (Personal Assistant to SDS)",
                                    "SDS SECRETARY I / II",
                                    "SDS CLERK",
                                    "SDS ORDERLY",
                                    "ESCORT COMMANDER",
                                    "SDS' DRIVER / SDS BACKUP DRV"
                                ]
                            },
                            {
                                "name": "Special Inter. Squard (SIS)",
                                "designations": [
                                    "SIS (Operative)"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "DEPUTY DIRECTOR SECURITY ENFORCEMENT",
                        "sections": [
                            {
                                "name": "Enforcement",
                                "designations": [
                                    "AD SY",
                                    "PSO SE (Principal Staff Officer Security Enforcement)",
                                    "SO EXPLOSIVES",
                                    "SE SO STRATEGIC",
                                    "S.E SO NGO",
                                    "SO LOCUST",
                                    "SO MINING/HUNTERS"
                                ]
                            },
                            {
                                "name": "Surveillance",
                                "designations": [
                                    "SO SUV (Staff Officer Surveillance)"
                                ]
                            },
                            {
                                "name": "Airport",
                                "designations": [
                                    "OC AIRPORT (Officer in Charge Airport)"
                                ]
                            },
                            {
                                "name": "Hotel Checks",
                                "designations": [
                                    "SO HOTEL CHECKS / 2 i/c HOTEL CHECKS"
                                ]
                            },
                            {
                                "name": "Details to State Officials",
                                "designations": [
                                    "CHIEF DETAIL TO STATE GOVR / DEP. GOVR",
                                    "DETAIL TO GOVR / DEP. GOVR",
                                    "DETAIL TO GOVR'S SPOUSE / DEP.GOVER'S SPOUSE",
                                    "DETAIL TO SPEAKER / CHIEF DETAIL TO SPEAKER"
                                ]
                            },
                            {
                                "name": "Security Support",
                                "designations": [
                                    "DDSY SECRETARY",
                                    "DDSY DRIVER",
                                    "ORDERLY",
                                    "OPERATIVE",
                                    "ARMOURER"
                                ]
                            },
                            {
                                "name": "Physical Security (SHSS, Command House)",
                                "designations": [
                                    "PHYSICAL SECURITY",
                                    "STEWARD",
                                    "CLEANER"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "DEPUTY DIRECTOR VETTING OFFICE",
                        "sections": [
                            {
                                "name": "Vetting Office",
                                "designations": [
                                    "DD VETTING",
                                    "AD VETTING",
                                    "PSO VETTING",
                                    "SO VETTING",
                                    "VETTING STAFF",
                                    "DDS VET. DRV"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "DEPUTY DIRECTOR ADMIN AND LOGISTICS",
                        "sections": [
                            {
                                "name": "Admin Registry / Admin",
                                "designations": [
                                    "DD A/L",
                                    "AD A/L",
                                    "DD A/L SECRETARY I",
                                    "PSO A",
                                    "SO ADMIN",
                                    "ADMIN",
                                    "DD A/L CLERK / ORDERLY"
                                ]
                            },
                            {
                                "name": "Finance",
                                "designations": [
                                    "SOF (Staff Officer Finance)",
                                    "CLERK"
                                ]
                            },
                            {
                                "name": "Clinic",
                                "designations": [
                                    "NURSE CLINIC / COMMAND MIDWIFE",
                                    "CLINIC ASST"
                                ]
                            },
                            {
                                "name": "Training Section",
                                "designations": [
                                    "PSO (Training)",
                                    "TRAINING"
                                ]
                            },
                            {
                                "name": "Transport Section",
                                "designations": [
                                    "SOT (Staff Officer Transport)",
                                    "POOL (Driver)"
                                ]
                            },
                            {
                                "name": "Technical / Communication",
                                "designations": [
                                    "COMMUNICATION",
                                    "OPERATIVE (Comm.)"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "DEPUTY DIRECTOR INTELLIGENCE",
                        "sections": [
                            {
                                "name": "INT Section",
                                "designations": [
                                    "DDINT",
                                    "AD INT",
                                    "INT (Operative)"
                                ]
                            },
                            {
                                "name": "Open Source (OSINT)",
                                "designations": [
                                    "PSO OSINT",
                                    "OSINT (Operative)"
                                ]
                            },
                            {
                                "name": "Registry",
                                "designations": [
                                    "R.S (Registry Staff)",
                                    "REGISTRY / REGISTRY CLERK"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "OPERATION DEPARTMENT",
                        "sections": [
                            {
                                "name": "Operations Unit / OPS",
                                "designations": [
                                    "DD OPERATION",
                                    "AD OPS / AD STRG OPS",
                                    "PSO OPS",
                                    "OSP (Operative)",
                                    "SO POLITICS / SO Labour / SO STUDENT",
                                    "SUSPECT HANDLER",
                                    "OPS (ISLAMIC DESK)",
                                    "OPERATIVE (SO Christian Desk)",
                                    "OPERATIVE (SO HEALTH / PHARMACITICAL)"
                                ]
                            },
                            {
                                "name": "DLS",
                                "designations": [
                                    "PSO DLS"
                                ]
                            },
                            {
                                "name": "Galaxy",
                                "designations": [
                                    "OPERATIVE"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "COUNTER TERRRORISM DEPARTMENT",
                        "sections": [
                            {
                                "name": "Tactical Team / CT",
                                "designations": [
                                    "AD CT",
                                    "TACTICAL TEAM (Operative)"
                                ]
                            },
                            {
                                "name": "Agro Intelligence",
                                "designations": [
                                    "PSO AGRO",
                                    "AGRO INT (Operative)"
                                ]
                            },
                            {
                                "name": "Special Ops (SOPS)",
                                "designations": [
                                    "PSO SOPS",
                                    "S/OPS (Operative)"
                                ]
                            }
                        ]
                    },
                    {
                        "name": "INVESTIGATION DEPARTMENT",
                        "sections": [
                            {
                                "name": "Investigation",
                                "designations": [
                                    "DD INVESTIGATION (DD SY INV)",
                                    "ADSY INV",
                                    "POS INVEST",
                                    "OPERATIVE"
                                ]
                            },
                            {
                                "name": "Economic Intelligence (E.I.)",
                                "designations": [
                                    "AD EI",
                                    "PSO E.I.",
                                    "SO E.I.",
                                    "E.I. (Operative)"
                                ]
                            }
                        ]
                    }
                ]
            }
        }

        # Load from file if provided
        if options['file']:
            try:
                with open(options['file'], 'r') as f:
                    org_data = json.load(f)
                self.stdout.write(self.style.SUCCESS(f'Loaded data from {options["file"]}'))
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'File not found: {options["file"]}'))
                return
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f'Invalid JSON: {e}'))
                return

        # Clear existing data if requested
        if options['clear']:
            self.stdout.write('Clearing existing organizational data...')
            Designation.objects.all().delete()
            Section.objects.all().delete()
            Department.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared existing data'))

        # Load the data
        departments_data = org_data.get('organization', {}).get('departments', [])
        
        dept_count = 0
        section_count = 0
        designation_count = 0

        for dept_data in departments_data:
            # Create or get department
            department, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={'description': dept_data.get('description', '')}
            )
            if created:
                dept_count += 1
                self.stdout.write(f'Created department: {department.name}')

            # Process sections
            for section_data in dept_data.get('sections', []):
                section, created = Section.objects.get_or_create(
                    name=section_data['name'],
                    defaults={'department': department}
                )
                if created:
                    section_count += 1
                    self.stdout.write(f'  Created section: {section.name}')
                elif section.department != department:
                    # Update department if it changed
                    section.department = department
                    section.save()
                    self.stdout.write(f'  Updated section: {section.name}')

                # Process designations
                for designation_name in section_data.get('designations', []):
                    designation, created = Designation.objects.get_or_create(
                        name=designation_name,
                        section=section
                    )
                    if created:
                        designation_count += 1
                        self.stdout.write(f'    Created designation: {designation_name}')

        self.stdout.write(self.style.SUCCESS(
            f'\nSuccessfully loaded organizational structure:\n'
            f'  Departments: {dept_count} created\n'
            f'  Sections: {section_count} created\n'
            f'  Designations: {designation_count} created'
        ))
