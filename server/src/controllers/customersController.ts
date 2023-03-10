import { upload } from "./../utils/imageUpload";
import reservationsService from "../services/reservationsService";
import customersService from "../services/customersService";
import { IGetAuthRequest } from "../types";
import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import express, { Router } from "express";
import { checkAuth, checkRole } from "../utils/jwt";

export const router = Router({ mergeParams: true });

const createCustomerProfile = catchAsync(
	async (req: IGetAuthRequest, res: Response) => {
		const profile = await customersService.create(req.user.id, {
			avatar: req.file,
			...req.body,
		});
		return res.json(profile);
	}
);

const getProfileByUsername = catchAsync(async (req: Request, res: Response) => {
	const profile = await customersService.getByUsername(req.params.username);
	return res.json(profile);
});

const getProfileByUserId = catchAsync(async (req: Request, res: Response) => {
	const profile = await customersService.getByUserId(req.params.id);
	return res.json(profile);
});

const updateProfile = catchAsync(
	async (req: IGetAuthRequest, res: Response) => {
		const profile = await customersService.update(req.user.id, {
			avatar: req.file,
			...req.body,
		});
		return res.json(profile);
	}
);

const deleteProfile = catchAsync(
	async (req: IGetAuthRequest, res: Response) => {
		await customersService.delete(req.user.id, req.params.id);
		return res.json({ ok: true });
	}
);

const getReservationsByUser = catchAsync(
	async (req: IGetAuthRequest, res: Response) => {
		const reservations = await reservationsService.getReservationsByUser(
			req.user.id
		);
		return res.json(reservations);
	}
);

// POST /api/customers/
router.post(
	"/",
	checkAuth,
	checkRole("customer"),
	upload.single("avatar"),
	createCustomerProfile
);

// GET /api/customers/:id
router.get("/:id", getProfileByUserId);

// GET /api/customers/:username
router.get("/:username", getProfileByUsername);

// PUT /api/customers/:id
router.put(
	"/:id",
	checkAuth,
	checkRole("customer"),
	upload.single("avatar"),
	updateProfile
);

// DELETE /api/customers/:id
router.delete("/:id", checkAuth, checkRole("customer"), deleteProfile);

// GET /api/users/:id/reservations
router.get(
	"/user/:id/reservations",
	checkRole("customer"),
	getReservationsByUser
);
