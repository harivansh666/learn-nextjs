"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return;
    //check if user alrady exist
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkID: userId
      }
    })
    if (existingUser) return existingUser


    const dbuser = await prisma.user.create({

      data: {
        clerkID: userId,
        name: `${user.firstName || ""}  ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split('@')[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      }
    });
    return dbuser
  } catch (error) {
    console.log(error);
  }
}

export async function getUserByClerkID(clerkID: string) {
  try {
    prisma.user.findUnique({
      where: {
        clerkID,
      },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            post: true
          }
        }
      }
    })
  } catch (error) {
    console.log(error)
  }
}
