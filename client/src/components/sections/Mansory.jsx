"use client"

import Image from "next/image";
import Link from "next/link";

import { client, urlFor } from "@/utils/sanity"
import { v4 as uuidv4 } from 'uuid';
import { useState } from "react";
import { FiUpload, FiMoreHorizontal } from "react-icons/fi";
import fetchUser from "@/utils/fetchUser";

const Mansory = ({ title, arr }) => {
    const [open, setOpen] = useState(false);
    const [savingPost, setSavingPost] = useState(false);
    const user = fetchUser();

    let alreadySaved = arr?.filter((pin) => pin?.save?.some((item) => item?.postedBy?._id === user?.googleId));
    alreadySaved = alreadySaved?.length > 0 ? alreadySaved : [];

    const savePin = async (id) => {
        try {
            if (alreadySaved?.length === 0) {
                setSavingPost(true);
                const savedPin = await client
                    .patch(id)
                    .setIfMissing({ save: [] })
                    .insert('after', 'save[-1]', [{
                        _key: uuidv4(),
                        userId: user?._id,
                        postedBy: {
                            _type: 'postedBy',
                            _ref: user?._id,
                        },
                    }])
                    .commit()
                    .then(() => {
                        window.location.reload();
                        setSavingPost(false);
                    });
            }
        } catch (error) {
            throw new Error(error);
        }
    };





    return (
        <div>
            <h3 className='block text-center py-10 text-3xl text-copy font-bold leading-tight'>{title}</h3>
            {
                arr?.length ?
                    (
                        <div className='grid_mansory'>
                            {arr && arr?.map(({ postedBy, image, _id, save }, i) => (
                                <div key={i} className={`${i / 2 == 1 ? "small" : "big"} bg-slate-200 rounded-3xl overflow-hidden relative`}>
                                    <Image src={urlFor(image?.asset?.url)?.url() || ""} fill alt={postedBy?.username || "image"} className="object-cover object-center z-0" />
                                    <div className="h-full p-4 flex flex-col justify-between relative z-[2] bg-black bg-opacity-60 pin-card">
                                        <div className="flex justify-between items-center relative -top-52">
                                            <span className="text-base text-white font-bold line-clamp-1 cursor-pointer">{postedBy?.username}</span>
                                            {
                                                alreadySaved?.length !== 0
                                                    ? (<span onClick={(e) => {
                                                        e.stopPropagation();
                                                        deletePin(_id);
                                                    }} className="text-base text-white font-bold px-8 py-2 bg-primary rounded-full cursor-pointer hover:bg-primary-dark">Saved</span>)
                                                    : (<span onClick={(e) => {
                                                        e.stopPropagation();
                                                        savePin(_id);
                                                    }} className="text-base text-white font-bold px-8 py-2 bg-primary rounded-full cursor-pointer hover:bg-primary-dark"> {save?.length}   {savingPost ? 'Saving' : 'Save'}</span>)
                                            }
                                        </div>
                                        <div className="flex justify-end items-center gap-2.5 relative -bottom-52">
                                            <Link href={`pin/${_id}`}>
                                                <button className="p-3 bg-background rounded-full text-left cursor-pointer">
                                                    <FiUpload className="text-lg" />
                                                </button>
                                            </Link>
                                            <button className="p-3 bg-background rounded-full text-left cursor-pointer relative" onClick={() => setOpen(!open)} >
                                                <FiMoreHorizontal className="text-lg" />
                                                <div className={`absolute -left-12 bottom-52 -translate-x-1/2 -translate-y-1/2 w-52 py-2.5 px-1.5 border rounded-xl shadow-xl bg-background ${open ? "block" : "hidden"}`}>
                                                    <ul className="flex flex-col gap-1.5">
                                                        <li className="px-2.5 py-1.5 text-base text-copy font-bold leading-normal cursor-pointer hover:bg-gray-200 hover:rounded-lg">
                                                            Hide pin
                                                        </li>
                                                        <Link href={`${image.asset.url}?dl=`} download onClick={(e) => e.stopPropagation()}>
                                                            <li className="px-2.5 py-1.5 text-base text-copy font-bold leading-normal cursor-pointer hover:bg-gray-200 hover:rounded-lg">
                                                                Download image
                                                            </li>
                                                        </Link>
                                                    </ul>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                    : arr?.length < 0 ? (<div className="h-96 flex-center"><h1> There is no pins add yours <a href="/pin/create">Add</a> </h1></div>)
                        : (<div className="h-96 flex-center"><h1> Loading </h1></div>)
            }

        </div>
    )
}

export default Mansory