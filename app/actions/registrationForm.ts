'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function submitRegistrationForm(token: string, data: any) {
    const application = await prisma.accountApplication.findUnique({
        where: { registrationToken: token }
    });

    if (!application || application.status !== 'APPROVED' || application.registrationFormId) {
        throw new Error('Invalid or expired registration token');
    }

    // Hash a temporary password. In a real app, you'd send a reset password link or have them set it here.
    const tempPassword = await bcrypt.hash('Welcome123!', 10);

    const result = await prisma.$transaction(async (tx) => {
        // 1. Create the Registration Form record
        const registrationForm = await tx.registrationForm.create({
            data: {
                fullLegalName: data.fullLegalName,
                dateOfBirth: new Date(data.dateOfBirth),
                ssnItin: data.ssnItin, // In real world, hash/encrypt this
                mothersMaidenName: data.mothersMaidenName,
                
                residentialAddress: data.residentialAddress,
                mailingAddress: data.mailingAddress,
                primaryPhoneType: data.primaryPhoneType,
                
                employmentStatus: data.employmentStatus,
                occupation: data.occupation,
                employerName: data.employerName,
                primarySourceOfFunds: data.primarySourceOfFunds,
                estimatedAnnualIncome: data.estimatedAnnualIncome,
                
                primaryIdType: data.primaryIdType,
                idNumber: data.idNumber,
                stateCountryOfIssuance: data.stateCountryOfIssuance,
                issueDate: new Date(data.issueDate),
                expirationDate: new Date(data.expirationDate),
                idFrontDocumentUrl: data.idFrontDocumentUrl,
                idBackDocumentUrl: data.idBackDocumentUrl,
                
                overdraftProtection: data.overdraftProtection,
                debitCardRequest: data.debitCardRequest,
                nameToAppearOnCard: data.nameToAppearOnCard,
                statementPreference: data.statementPreference,
                
                fundingMethod: data.fundingMethod,
                externalAccountRoutingNumber: data.externalAccountRoutingNumber,
                externalAccountNumber: data.externalAccountNumber,
                initialDepositAmount: data.initialDepositAmount,
                
                w9Certification: data.w9Certification,
                electronicCommunicationsDisclosure: data.electronicCommunicationsDisclosure,
                depositAccountAgreement: data.depositAccountAgreement,
                digitalSignature: data.digitalSignature,
                signatureDate: new Date(data.signatureDate)
            }
        });

        // 2. Link application to registration form
        await tx.accountApplication.update({
            where: { id: application.id },
            data: { registrationFormId: registrationForm.id }
        });

        // 3. Create the actual User record
        const user = await tx.user.create({
            data: {
                firstName: data.fullLegalName.split(' ')[0],
                lastName: data.fullLegalName.split(' ').slice(1).join(' '),
                email: application.email,
                password: tempPassword,
                phone: data.primaryPhoneType ? application.phone : application.phone, // In a real app we'd split phone inputs, for now inherit from application
                dateOfBirth: new Date(data.dateOfBirth),
                address: data.residentialAddress,
                city: application.city,
                state: application.state,
                zipCode: application.zipCode
            }
        });

        // Update RegistrationForm with userId
        await tx.registrationForm.update({
            where: { id: registrationForm.id },
            data: { userId: user.id }
        });

        // 4. Create the initial Bank Account based on desired account type
        const accountTypeMap: Record<string, 'CHECKING' | 'SAVINGS' | 'BUSINESS'> = {
            'Everyday Checking': 'CHECKING',
            'High-Yield Savings': 'SAVINGS',
            'Certificate of Deposit': 'SAVINGS'
        };
        
        const mappedType = application.desiredAccountType ? accountTypeMap[application.desiredAccountType] || 'CHECKING' : 'CHECKING';

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

    return result;
}
