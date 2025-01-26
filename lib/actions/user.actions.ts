'use server'

import { isRedirectError } from "next/dist/client/components/redirect-error"
import { signInFormSchema, signUpFormSchema } from "../validators"
import { signIn, signOut } from "@/auth"
import { hashSync } from "bcrypt-ts-edge"
import { prisma } from "@/db/prisma"
import { formatError } from "../utils"

// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        })

        await signIn('credentials', user)

        console.log(user)

        return { success: true, message: 'Signed in successfully'}
    } catch (error) {
        if (isRedirectError(error)) {
            throw error
        }

        return { sucess: false, message: 'Invalid email or password'}
    }
}

// Sign user out
export async function signOutUser() {
    await signOut()
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) { 
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        })

        const plainsPassword = user.password

        user.password = hashSync(user.password, 10)

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password
            },
        })

        await signIn('credentials', {
            email: user.email,
            password: plainsPassword
        })

        return { success: true, message: "User registered successfully" }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error
        }

        return { sucess: false, message: formatError(error)}
    }
}