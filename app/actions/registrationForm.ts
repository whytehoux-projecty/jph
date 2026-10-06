'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { encryptDeterministic } from '@/lib/encryption';

export async function submitRegistrationForm(token: string, data: any) {
    const application = await prisma.accountApplication.findUnique({
        where: { registrationToken: token }
    });

    if (!application || application.status !== 'APPROVED' || application.registrationFormId) {
        throw new Error('Invalid or expired registration token');
    }

    const tempPassword = await bcrypt.hash('Welcome123!', 10);

    const result = await prisma.$transaction(async (tx) => {
        const settings = await tx.systemSettings.findFirst();
        const minDeposit = settings?.minimumInitialDeposit || 0;
        if (data.initialDepositAmount < minDeposit) {
            throw new Error(`Initial deposit must be at least $${minDeposit}`);
        }

        // 1. Create the Registration Form record
        const registrationForm = await tx.registrationForm.create({
            data: {
                title: data.title,
                gender: data.gender,
                maritalStatus: data.maritalStatus,
                nationality: data.nationality,
                countryOfResidence: data.countryOfResidence,
                fullLegalName: data.fullLegalName,
                dateOfBirth: new Date(data.dateOfBirth),
                ssnItin: encryptDeterministic(data.ssnItin), // encrypted
                mothersMaidenName: data.mothersMaidenName || 'N/A',

                nextOfKinName: data.nextOfKinName,
                nextOfKinRelationship: data.nextOfKinRelationship,
                nextOfKinPhone: data.nextOfKinPhone,
                nextOfKinAddress: data.nextOfKinAddress,
                
                residentialAddress: data.residentialAddress,
                mailingAddress: data.mailingAddress,
                primaryPhoneType: data.primaryPhoneType,
                secondaryPhone: data.secondaryPhone,
                
                employmentStatus: data.employmentStatus,
                occupation: data.occupation,
                employerName: data.employerName,
                employerAddress: data.employerAddress,
                primarySourceOfFunds: data.primarySourceOfFunds,
                estimatedAnnualIncome: data.estimatedAnnualIncome,
                
                purposeOfAccount: data.purposeOfAccount,
                expectedMonthlyVolume: data.expectedMonthlyVolume,

                entityType: data.entityType,
                businessRegistrationNo: data.businessRegistrationNo,
                businessName: data.businessName,
                dbaName: data.dbaName,
                ein: data.ein ? encryptDeterministic(data.ein) : null,
                stateOfFormation: data.stateOfFormation,
                yearOfFormation: data.yearOfFormation,
                industry: data.industry,
                website: data.website,
                uboDeclaration: data.uboDeclaration,

                primaryIdType: data.primaryIdType,
                idNumber: encryptDeterministic(data.idNumber),
                stateCountryOfIssuance: data.stateCountryOfIssuance,
                issueDate: new Date(data.issueDate),
                expirationDate: new Date(data.expirationDate),
                idFrontDocumentUrl: data.idFrontDocumentUrl,
                idBackDocumentUrl: data.idBackDocumentUrl,
                passportPhotoUrl: data.passportPhotoUrl,

                proofOfAddressType: data.proofOfAddressType,
                proofOfAddressUrl: data.poaWaiverRequested ? null : data.proofOfAddressUrl,
                poaWaiverRequested: data.poaWaiverRequested,
                
                isUsTaxPerson: data.isUsTaxPerson,
                foreignTaxResidencies: data.foreignTaxResidencies,
                w8benCertification: data.w8benCertification,
                isPep: data.isPep,
                pepDetails: data.pepDetails,
                sanctionsDeclaration: data.sanctionsDeclaration,

                overdraftProtection: data.overdraftProtection,
                debitCardRequest: data.debitCardRequest,
                nameToAppearOnCard: data.nameToAppearOnCard,
                statementPreference: data.statementPreference,
                
                fundingMethod: data.fundingMethod,
                externalAccountRoutingNumber: data.externalAccountRoutingNumber ? encryptDeterministic(data.externalAccountRoutingNumber) : null,
                externalAccountNumber: data.externalAccountNumber ? encryptDeterministic(data.externalAccountNumber) : null,
                initialDepositAmount: data.initialDepositAmount,
                
                w9Certification: data.w9Certification,
                electronicCommunicationsDisclosure: data.electronicCommunicationsDisclosure,
                depositAccountAgreement: data.depositAccountAgreement,
                marketingConsent: data.marketingConsent ?? true,
                digitalSignature: data.digitalSignature,
                signatureDate: new Date(data.signatureDate)
            }
        });

        // 2. Link application to registration form and mark as completed
        await tx.accountApplication.update({
            where: { id: application.id },
            data: { 
                registrationFormId: registrationForm.id,
                status: 'COMPLETED'
            }
        });

        // 3. Create the actual User record
        const user = await tx.user.create({
            data: {
                firstName: data.fullLegalName.split(' ')[0] || application.firstName,
                lastName: data.fullLegalName.split(' ').slice(1).join(' ') || application.lastName,
                email: application.email,
                password: tempPassword,
                phone: application.phone,
                dateOfBirth: new Date(data.dateOfBirth),
                address: data.residentialAddress,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode,
                profileType: application.applicationType === 'BUSINESS' ? 'BUSINESS' : 'PERSONAL'
            }
        });

        await tx.registrationForm.update({
            where: { id: registrationForm.id },
            data: { userId: user.id }
        });

        // 4. Create the initial Bank Account based on desired account type
        const accountTypeMap: Record<string, string> = {
            'Everyday Checking': 'CHECKING',
            'High-Yield Savings': 'SAVINGS',
            'Certificate of Deposit': 'SAVINGS',
            'Private Wealth Reserve': 'BUSINESS'
        };
        
        let mappedType = application.desiredAccountType ? accountTypeMap[application.desiredAccountType] || 'CHECKING' : 'CHECKING';
        if (application.applicationType === 'BUSINESS') {
            mappedType = 'BUSINESS';
        }

        const account = await tx.account.create({
            data: {
                userId: user.id,
                accountNumber: Math.floor(Math.random() * 9000000000) + 1000000000 + '',
                accountType: mappedType,
                balance: data.initialDepositAmount,
                currency: application.currencyPreference || 'USD',
                status: 'ACTIVE'
            }
        });

        // 5. Create initial funding transaction
        if (data.initialDepositAmount > 0) {
            await tx.transaction.create({
                data: {
                    accountId: account.id,
                    type: 'CREDIT',
                    transactionType: 'LOCAL_TRANSFER',
                    amount: data.initialDepositAmount,
                    status: 'COMPLETED',
                    description: `Initial Funding via ${data.fundingMethod}`,
                    reference: `FUND-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
                }
            });
        }

        return { user, account };
    });

    revalidatePath('/admin/customers/account-holders');
    revalidatePath('/admin/customers/applications');

    return { success: true, userId: result.user.id, accountId: result.account.id };
}
