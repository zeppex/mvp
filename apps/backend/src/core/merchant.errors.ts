import { HttpStatus } from '@nestjs/common';
export const MerchantErrors = {
    MERCHANT_NOT_FOUND: {
        status: HttpStatus.NOT_FOUND,
        message: 'Merchant Id: $merchantId not found',
        fields: ['merchantId'],

    },
    BRANCH_NOT_FOUND: {
        status: HttpStatus.NOT_FOUND,
        message: 'Branch Id: $branchId not found',
        fields: ['branchId'],
    },
    POS_NOT_FOUND: {
        status: HttpStatus.NOT_FOUND,
        message: 'POS Id: $posId not found',
        fields: ['posId'],
    },
    MERCHANT_ALREADY_EXISTS: {
        status: HttpStatus.CONFLICT,
        message: 'Merchant Id: $merchantId already exists',
        fields: ['merchantId'],
    },
    BRANCH_ALREADY_EXISTS: {
        status: HttpStatus.CONFLICT,
        message: 'Branch Id: $branchId already exists',
        fields: ['branchId'],
    },
    POS_ALREADY_EXISTS: {
        status: HttpStatus.CONFLICT,
        message: 'POS Id: $posId already exists',
        fields: ['posId'],
    },
    
} as const;